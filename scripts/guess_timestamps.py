from datetime import datetime
today = datetime.today()
from appcubator.models import App
import sys

for line in sys.stdin.readlines():

  try:
    app_id = int(line.strip())
  except ValueError:
    print "meow %d " % app_id

    continue

  appids.append(app_id)

def estimate_timestamp(app):
  apps_before = App.objects.filter(id__lt=app.id).order_by('-id')
  if apps_before.exists():
    lower_bound = apps_before[0].created_on
  else:
    lower_bound = apps.owner.date_joined

  apps_after = App.objects.filter(id__gt=app.id).order_by('id')
  if apps_after.exists():
    upper_bound = apps_after[0].created_on
  else:
    upper_bound = today
  return (lower_bound + upper_bound)/2.0


for appid in appids:
  app = App.objects.get(pk=appid)
  print estimate_timestamp(app)
