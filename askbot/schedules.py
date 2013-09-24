"""tests on whether certain scheduled tasks need
to be performed at the moment"""
from datetime import datetime
import pytz

def should_update_avatar_data(request):
    """True if it is time to update user's avatar data
    user is taken from the request object
    """
    user = request.user
    if user.is_authenticated():
        if (pytz.UTC.localize(datetime.today()) - user.last_login).days <= 1:
            #avatar is updated on login anyway
            return False
        updated_at = request.session.get('avatar_data_updated_at', None)
        if updated_at is None:
            return True
        else:
            return (pytz.UTC.localize(datetime.now()) - pytz.UTC.localize(updated_at)).days > 0
    return False
