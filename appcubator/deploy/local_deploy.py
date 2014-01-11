import requests
import logging
from django.conf import settings
import os
import tarfile
logger = logging.getLogger(__name__)


class DeploymentError(Exception):
    """Should be raised whenever the deployment server does not return 200"""
    pass

class NotDeployedError(Exception):
    """Indicates that the deployment id is bogus"""
    pass

def update_deployment_info(deployment_id, hostname):
    """Update the deployment with the new hostname"""

def get_deployment_status(deployment_id):
    """
    Returns 0, 1, or 2.
     0 = No task running
     1 = Running
     2 = Task done, plz collect result.
    """

def write_tar_from_app_dir(appdir):
    """Given the directory of the app, tar it up and return the path to the tar."""

def transport_app(appdir, deploy_id, deploy_data, retry_on_404=True):
    """
    1. path to directory where app is stored
    2. deployment id (or none if it's not yet deployed)
    3. dictionary of deploy data
            "hostname": app.hostname(),
            "app_json": app.state_json,
            "deploy_secret": "v1factory rocks!",

    returns deployment_id
    """
    # tar it up
    tar_path = write_tar_from_app_dir(appdir)
    f = open(tar_path, "r")
    try:
        # catapult the tar over to the deployment server
        pass

    finally:
        f.close()
        os.remove(os.path.join(appdir, 'payload.tar'))

    if r.status_code == 200:
        return response_content['deployment_id']

    elif r.status_code == 404 or (r.status_code == 502 and requests.get("http://%s/lskdjflskjf/" % settings.DEPLOYMENT_HOSTNAME).status_code == 404):
        if retry_on_404:
            logger.warn("The deployment was not found, so I'm setting deployment id to None")
            return transport_app(appdir, None, deploy_data, retry_on_404=False)
        else:
            raise NotDeployedError()

    else:
        raise DeploymentError("Deployment server error: %r" % r.text)
