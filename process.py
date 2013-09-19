#!/usr/bin/env python
import sys
from collections import Counter

if __name__ == "__main__":
    lines = open(sys.argv[1], "r").readlines()
    lines2 = [ l.split("\t") for l in lines ]

    header_line = lines2[0]
    lines = lines2[1:]

    visits = Counter()
    print header_line
    #lines = lines[:10]
    for l in lines:
        if 'visited' in l[5]:
            app_id_key = l[1]
            visits[app_id_key] += 1

    print "APP ID\tPAGE VIEWS"
    top_n_percent = lambda n: n * len(visits)/100
    for app_id, views in visits.most_common(top_n_percent(3)):
        print "%s\t%s" % (app_id, views)



