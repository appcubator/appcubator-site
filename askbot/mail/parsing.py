"""a module for parsing email response text
this file is a candidate for publishing as an independent module
"""
import re
import sys
from askbot.conf import settings as askbot_settings

#Regexes for quote separators
#add more via variables ending with _QUOTE_RE
#These regexes do not contain any trailing:
#* newline chars,
#* lines starting with | or >
#* lines consisting entirely of empty space
#expressions are stripped of month and day names
#to keep them simpler and make the additions of language variants
#easier.
QUOTE_REGEXES = (
    #GMAIL_QUOTE_RE = 
    r'\nOn [^\n]* wrote:\Z',
    #GMAIL_SECOND_QUOTE_RE = 
    r'\n\d{4}/\d{1,2}/\d{1,2} [^\n]*\Z',
    #OUTLOOK1_QUOTE_RE = 
    r'\n-+Original Message-+\nFrom:.*?\nSent:.*?\nTo:.*?\nSubject:.*?\Z',
    #YAHOO_QUOTE_RE = 
    r'\n_+\n\s*From: [^\n]+\nTo: [^\n]+\nSent: [^\n]+\nSubject: [^\n]+\Z',
    #KMAIL_QUOTE_RE = 
    r'\AOn [^\n]+ you wrote:\s*\n\n',
    #OUTLOOK_RTF_QUOTE_RE = 
    r'\nSubject: [^\n]+\nFrom: [^\n]+\nTo: [^\n]+\nDate: [^\n]+\Z',
    #OUTLOOK_TEXT_QUOTE_RE = 
    r'\n_+\Z',
)


# extra samples
"""
-----Original Message-----^M
From: forum@example.com [mailto:forum@example.com] ^M
Sent: Wednesday, August 07, 2013 11:00 AM^M
To: Jane Doe^M
Subject: "One more test question from email."^M

"""


def compile_quote_regexes():
    compiled_regexes = list()
    for regex in QUOTE_REGEXES:
        compiled_regexes.append(
            re.compile(
                regex,
                re.MULTILINE | re.IGNORECASE
            )
        )
    return compiled_regexes

CLIENT_SPECIFIC_QUOTE_REGEXES = compile_quote_regexes()

def strip_trailing_empties_and_quotes(text):
    #strip empty lines and quote lines starting with | and >
    return re.sub(r'(([\n\s\xa0])|(\n[\|>][^\n]*))*\Z', '', text)

def strip_leading_empties(text):
    return re.sub(r'\A[\n\s\xa0]*', '', text)

def strip_trailing_sender_references(text, email_address):
    server_email = 'ask@' + askbot_settings.REPLY_BY_EMAIL_HOSTNAME
    email_pattern = '(%s|%s)' % (email_address, server_email)
    pattern = r'\n[^\n]*%s[^\n]*$' % email_pattern
    return re.sub(pattern, '', text, re.IGNORECASE)

def strip_email_client_quote_separator(text):
    """strips email client quote separator from the responses,
    e.g. (on such date XYZ wrote)

    if one client-specific separator matches, then result
    is immediately returned
    """
    for regex in CLIENT_SPECIFIC_QUOTE_REGEXES:
        if regex.search(text):
            return regex.sub('', text)
    #did not find a quote separator!!! log it
    log_message = u'\nno matching quote separator: %s\n' % text
    sys.stderr.write(log_message.encode('utf-8'))
    text_lines = text.splitlines(False)
    return ''.join(text_lines[:-3])#strip 3 lines as a guess

def extract_reply_contents(text, reply_separator=None):
    """If reply_separator is given,
    take the part above the separator.
    After, strip the email-client-specific text

    ``text`` is the input text
    ``reply_separator`` is either a string or a regex object
    """
    if reply_separator:
        if isinstance(reply_separator, basestring):
            text = text.split(reply_separator)[0]
        else:
            testre = re.compile('test')
            if type(testre) == type(reply_separator):
                text = reply_separator.split(text)[0]
            else:
                raise ValueError('reply_separator must be a string or a compiled regex')

    text = strip_trailing_empties_and_quotes(text)
    text = strip_email_client_quote_separator(text)
    text = strip_trailing_empties_and_quotes(text)
    return strip_leading_empties(text)
