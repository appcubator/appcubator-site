from appcubator.models import App
import json

with open('iframe_bootstrap.css') as f:
    bootstrap = f.read()

for a in App.objects.all():
    us = a.uie_state
    us['basecss'] = bootstrap + '\n\n' + us['basecss']
    a._uie_state_json = json.dumps(us)
    #a.save()

from datetime import datetime
today = datetime.today()
print "done. the time now is %s" % today
