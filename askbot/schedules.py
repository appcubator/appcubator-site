"""tests on whether certain scheduled tasks need
to be performed at the moment"""
from datetime import datetime
import pytz
utc = pytz.UTC
def make_aware(dt):
    try:
        return utc.localize(dt)
    except ValueError:
        return dt

def should_update_avatar_data(request):
    """True if it is time to update user's avatar data
    user is taken from the request object
    """
    user = request.user
    if user.is_authenticated():
        if (make_aware(datetime.today()) - user.last_login).days <= 1:
            #avatar is updated on login anyway
            return False
        updated_at = request.session.get('avatar_data_updated_at', None)
        if updated_at is None:
            return True
        else:
            return (make_aware(datetime.now()) - make_aware(updated_at)).days > 0
    return False
