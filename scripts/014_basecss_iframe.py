from appcubator.models import App
import json
import os, os.path
join = os.path.join
import cssutils

def new_basecss(uie_state):
    from django.template import loader, Context
    context = Context({'uie_state': uie_state,
                       'isMobile': False,
                       'deploy': False})
    t = loader.get_template('migrate-editor-css.html')
    css_string = t.render(context)


    css = cssutils.parseString(css_string)
    rules = css.cssRules
    print rules.length
    for x in range(0, rules.length):
        if rules.item(x).typeString == "STYLE_RULE":
            selector_list = rules.item(x).selectorList
            for y in range(0, selector_list.length):
                if selector_list[y].selectorText != "body":
                    selector_list[y].selectorText = selector_list[y].selectorText.replace('body','',1)

    return css.cssText

with open(join(os.path.dirname(__file__), '010_iframe_bootstrap.css')) as f:
    bootstrap = f.read()

for a in App.objects.all():
    us = a.uie_state
    new_base_css = new_basecss(us)
    us['basecss'] = bootstrap + '\n\n' + new_base_css
    a._uie_state_json = json.dumps(us)
    a.save()

from datetime import datetime
today = datetime.today()
print "done. the time now is %s" % today
