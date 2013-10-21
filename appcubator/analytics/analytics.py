# a contribution by @times

import sqlite3 as sq3
from datetime import datetime
import glob
import os

class Analytics(object):
  """ The Analytics package: Provides analytics on generated apps.
      Currently only supports basic web tracking analytics.
      Each analytics submodule takes in an application and provides the needed analytics.
  """

  class WebTrackingAnalytics(object):
    """ Accesses application data on the server and computes analytics """

    def __init__(self, app_dir):
      self.app_dir = app_dir
      self.conn = sq3.connect(os.path.join(self.app_dir, "db"))
      self.TABLE_NAME = "tracking_visitor"

    def get_total_users(self):
      c = self.conn.cursor()
      total_users_tmp = c.execute("select count(*) from %s" % self.TABLE_NAME)
      total_users = total_users_tmp.fetchone()[0]
      return total_users

    def get_total_active_users(self):
      now = str(datetime.now()).split('.')[0]
      c = self.conn.cursor()
      query = "select count(*) from %s where " % self.TABLE_NAME
      query += "last_update >= %s" % now
      total_users = c.execute(query).fetchone()[0]
      return total_users

    def get_total_page_views(self):
      c = self.conn.cursor()
      total_users_tmp = c.execute("select sum(page_views) from %s" % self.TABLE_NAME)
      total_users = total_users_tmp.fetchone()[0]
      return total_users

    def get_number_of_non_users(self):
      pass

    def get_number_of_users_on_page(self, page):
      pass


  def __init__(self, deployment_dir="/var/www/apps/"):
    self.deployment_dir = deployment_dir

  def get_web_tracking(self, app_name):
    json_data = {}
    app_dir = self.get_deployment_dir(app_name)
    web_tracking = Analytics.WebTrackingAnalytics(app_dir)
    json_data['total_users'] = web_tracking.get_total_users()
    json_data['total_active_users'] = web_tracking.get_total_active_users()
    json_data['total_page_views'] = web_tracking.get_total_page_views()
    return json_data

  def get_deployment_dir(self, app_name):
    search_dir = self.deployment_dir + "deployment-*%s" % app_name
    cands = glob.glob(search_dir)
    if len(cands) > 1:
      return None
    cand = cands[0]
    if os.path.isdir(cand):
      return cand

