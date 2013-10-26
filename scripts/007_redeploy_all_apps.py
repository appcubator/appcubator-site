from appcubator.models import App
from threading import Thread
import traceback

fail_summaries = []
pass_summaries = []
def summary(app):
    return (app.owner.id, app.owner.email, app.id, app.deployment_id, )

def deploy(app):
    a = app
    try:
        a.deploy()
    except Exception, e:
        fail_summaries.append([x for x in s] + [traceback.format_exc()])
        print "Fail: %r" % (s,)
        print traceback.format_exc()
    else:
        pass_summaries.append([x for x in s])
        print "Success: %r" % (s,)

threads = []
for a in App.objects.exclude(owner__email="!@TEST__USER@!@gmail.com")[50:]:
    s = summary(a)
    t = Thread(target=deploy, args=(a,))
    t.start()
    threads.append(t)
for t in threads:
    t.join()

with open("failed_rd.log", "w") as rl:
    log_text = "\n".join([ "\t".join([repr(d) for d in tupl]) for tupl in fail_summaries ])
    rl.write(log_text) # each line

with open("passed_rd.log", "w") as rl:
    log_text = "\n".join([ "\t".join([repr(d) for d in tupl]) for tupl in pass_summaries ])
    rl.write(log_text) # each line

