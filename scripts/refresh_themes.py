from appcubator.models import UITheme, load_initial_themes
import sys
import os

if __name__ == "__main__":

    if len(sys.argv) > 1:
        os.environ['DJANGO_SETTINGS_MODULE'] = sys.argv[1]
    print "deleting themes"
    for t in UITheme.objects.all():
        t.delete()
    load_initial_themes()
