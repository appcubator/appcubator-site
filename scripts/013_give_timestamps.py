from appcubator.models import App, User, LogAnything

all_logs = LogAnything.objects.using('readreplica1').all()
for a in App.objects.all():
  logs = all_logs.filter(app_id=a.id).order_by('timestamp') # earliest timestamp
  if not logs.exists():
    print "%d" % a.id
    continue

  l = logs[0]
  #print l.timestamp
  #a.created_on = l.timestamp
  #a.save()


