#!/usr/bin/env python
import threading
import sys
from collections import Counter
import requests

from appcubator.models import App, User

def relevant_formatted_information(app, metric, error=False):
    if not error:
        print '\t'.join([str(app.id), app.url(), str(metric)])
    else:
        print '\t'.join([str(app.id), app.url(), str(metric), "X"])

if __name__ == "__main__":
    lines = open(sys.argv[1], "r").readlines()
    lines2 = [ l.split("\t") for l in lines ]

    header_line = lines2[0]
    lines = lines2[1:]

    app_visits = Counter()
    user_visits = Counter()
    print header_line
    #lines = lines[:10]
    for l in lines:
        if 'visited' in l[5]:
            app_id_key = l[1]
            user_id_key = l[2]
            app_visits[app_id_key] += 1
            user_visits[user_id_key] += 1

    """
    print "APP ID\tPAGE VIEWS"
    top_n_percent = lambda n: n * len(app_visits) / 100
    for app_id, views in app_visits.most_common(top_n_percent(3)):
        try:
            app = App.objects.get(pk=app_id)
        except App.DoesNotExist:
            print "bro this app is gone :/"
        else:
            r = requests.get(app.url())
            if r.status_code == 404:
                print "uh oh"
                try:
                    app.deploy()
                except Exception:
                    print "FUCK "
                else:
                    print "oh yeah"
            relevant_formatted_information(app, views)
        print "%s\t%s" % (app_id, views)
        """


    print "USER\tPAGE VIEWS"
    top_n_percent = lambda n: n * len(user_visits) / 100
    for user_id, views in user_visits.most_common(top_n_percent(15)):
        print >> sys.stderr, user_id
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            print "no user found"
            continue
        try:
            print u"%d\t%s %s\t%d" % (user.id, user.first_name, user.last_name, views)
        except UnicodeEncodeError:
            print u"%d\t%s %s\t%d" % (user.id, "(unicode)", "(unicode)", views)
        user_apps_visits = []
        for app in user.apps.all():
            user_apps_visits.append( (app, app_visits[str(app.id)]) )

        reqs = []
        threads = []
        def get(app,i):
            r = requests.get(app.url())
            reqs[i] = r
            """
            if r.status_code == 404:
                print "uh oh"
                try:
                    app.deploy()
                except Exception:
                    print "FUCK "
                else:
                    print "oh yeah"
                    """

        # make parallel get requests to the apps
        for idx, (app, views) in enumerate(sorted(user_apps_visits, key=lambda x: x[1], reverse=True)[:3]):
            reqs.append(None)
            t = threading.Thread(target=get, args=(app, idx))
            #print >> sys.stderr, "started thread"
            t.start()
            threads.append(t)
        for t in threads:
            #print >> sys.stderr, "joining thread"
            t.join()

        for idx, (app, views) in enumerate(sorted(user_apps_visits, key=lambda x: x[1], reverse=True)[:3]):
            r = reqs[idx]
            if r.status_code == 404:
                error = True
            else:
                error = False
            relevant_formatted_information(app, views, error=error)
        #print "%s\t%s" % (app_id, views)

