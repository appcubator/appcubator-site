import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.template.loader import render_to_string

def send_email(from_email, to_email, subject, text, html):
  msg = MIMEMultipart('alternative')
  msg['Subject'] = subject
  msg['From'] = from_email
  msg['To'] = to_email
  text_part = MIMEText(text, 'plain')
  html_part = MIMEText(html, 'html')
  
  msg.attach(text_part)
  msg.attach(html_part)
  
  s = smtplib.SMTP('smtp.sendgrid.net', 587)
  s.login('maverickn', 'obscurepassword321')
  s.sendmail(from_email, to_email, msg.as_string())
  s.quit()

def send_template_email(from_email, to_email, subject, text, template_file, template_context):
  html = "<pre>%s</pre>" % render_to_string(template_file, template_context)
  send_email(from_email, to_email, subject, text, html)
