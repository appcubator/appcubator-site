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
    payload = { 'hostname': hostname }
    deployment_url = 'http://%s/deployment/%d/info/' % (settings.DEPLOYMENT_HOSTNAME, deployment_id)
    r = requests.post(deployment_url, data=payload, headers={'X-Requested-With': 'XMLHttpRequest'})
    if r.status_code == 200:
        return r
    elif r.status_code == 404:
        raise NotDeployedError()
    else:
        logger.error("Update deployment info failed: %r" % r.__dict__)
        raise DeploymentError()

def get_deployment_status(deployment_id):
    """
    Returns 0, 1, or 2.
     0 = No task running
     1 = Running
     2 = Task done, plz collect result.
    """
    deployment_url = 'http://%s/deployment/%d/task/status/' % (settings.DEPLOYMENT_HOSTNAME, deployment_id)
    r = requests.get(deployment_url, headers={'X-Requested-With': 'XMLHttpRequest'})
    if r.status_code != 200:
        logger.error("Get deployment status failed: %r" % r.__dict__)
        if r.status_code == 404:
            raise NotDeployedError()
        else:
            raise DeploymentError()

    # get data out
    d = r.json()
    status = d['status']
    message = d['message'] # not doing anything w this yet but know it exists.
    assert status in (0, 1, 2)
    if status == 2:
        # clear the result from the server so next time it will be 0
        deployment_url = 'http://%s/deployment/%d/task/result/' % (settings.DEPLOYMENT_HOSTNAME, deployment_id)
        r2 = requests.get(deployment_url, headers={'X-Requested-With': 'XMLHttpRequest'})

    return status


#def _write_tar_from_app_dir(self, appdir):
def write_tar_from_app_dir(appdir):
    """
    Given the directory of the app, tar it up and return the path to the tar.
    """
    contents = os.listdir(appdir)
    # tar it up
    t = tarfile.open(os.path.join(appdir, 'payload.tar'), 'w')
    for fname in contents:
        t.add(os.path.join(appdir, fname), arcname=fname)
    t.close()
    return os.path.join(appdir, 'payload.tar')

def transport_app(appdir, deploy_id, deploy_data, retry_on_404=True):
    """
    1. path to directory where app is stored
    2. deployment id (or none if it's not yet deployed)
    3. dictionary of deploy data
            "hostname": app.hostname(),
            "app_json": app.state_json,
            "deploy_secret": "v1factory rocks!",

    returns false, deployment_id
    or
    returns true, { files: [] , branch: "" }

    might raise DeploymentError or AssertionError.
    """
    # tar it up
    tar_path = write_tar_from_app_dir(appdir)
    f = open(tar_path, "r")
    try:
        # catapult the tar over to the deployment server
        files = {'file':f}
        post_data = deploy_data
        if deploy_id is None:
            try:
                r = requests.post("http://%s/deployment/" % settings.DEPLOYMENT_HOSTNAME, data=post_data, files=files, headers={'X-Requested-With': 'XMLHttpRequest'})
            except Exception:
                raise

        else:
            r = requests.post("http://%s/deployment/%d/" % (settings.DEPLOYMENT_HOSTNAME, deploy_id), data=post_data, files=files, headers={'X-Requested-With': 'XMLHttpRequest'})

    finally:
        f.close()
        os.remove(os.path.join(appdir, 'payload.tar'))

    if r.status_code == 200:
        result = {}
        response_content = r.json()
        logger.debug("Deployment response content: %r" % response_content)
        if 'deployment_id' not in response_content:
            raise DeploymentError("Deployment server had errors: %r" % response_content['errors'])

        # weirdo sanity check to make sure migration worked ok.
        try:
            syncdb_data = [ u for u in response_content['script_results'] if 'syncdb.py' in u['script'] ][0]
            if u'value to use for existing rows' in syncdb_data['stderr']:
                assert False, "Migration needs help!!!"
        except Exception:
            pass # this is the fast_deploy case

        return (False, response_content['deployment_id'])

    elif r.status_code == 404 or (r.status_code == 502 and requests.get("http://%s/lskdjflskjf/" % settings.DEPLOYMENT_HOSTNAME).status_code == 404):
        assert retry_on_404
        logger.warn("The deployment was not found, so I'm setting deployment id to None")
        return transport_app(appdir, None, deploy_data, retry_on_404=False)

    # merge conflict with custom code
    elif r.status_code == 409:
        result = {}
        response_content = r.json()
        logger.debug("Deployment response content: %r" % response_content)
        result['files'] = response_content['files']
        result['branch'] = response_content['branch']

        return (True, result)

    else:
        raise DeploymentError("Deployment server error: %r" % r.text)
