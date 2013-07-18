from appcubator.models import App
import traceback

fail_summaries = []
def summary(app):
    return (app.owner.id, app.owner.email, app.id, app.deployment_id, )

for a in App.objects.exclude(owner__email="!@TEST_USER@!@gmail.com"):
    s = summary(a)
    try:
        a.deploy()
    except Exception, e:
        fail_summaries.append([x for x in s] + [traceback.format_exc()])
        print "Fail: %r" % (s,)
        print traceback.format_exc()
    else:
        print "Success: %r" % (s,)

with open("redeploy.log", "w") as rl:
    log_text = "\n".join([ "\t".join([repr(d) for d in tupl]) for tupl in fail_summaries ])
    rl.write(log_text) # each line

