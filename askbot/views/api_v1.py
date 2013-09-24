from django.core.paginator import Paginator, EmptyPage, InvalidPage
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
from django.contrib.auth.models import User
from django.utils import simplejson
from django.db.models import Q
from django.core.urlresolvers import reverse
from askbot import models
from askbot.conf import settings as askbot_settings
from askbot.search.state_manager import SearchState
from askbot.utils.html import site_url

def get_user_data(user):
    """get common data about the user"""
    avatar_url = user.get_avatar_url()
    if not ('gravatar.com' in avatar_url):
        avatar_url = site_url(avatar_url)

    return {
        'id': user.id,
        'avatar': avatar_url,
        'username': user.username,
        'joined_at': user.date_joined.strftime('%s'),
        'last_seen_at': user.last_seen.strftime('%s'),
        'reputation': user.reputation,
    }

def get_question_data(thread):
    """returns data dictionary for a given thread"""
    datum = {
        'added_at': thread.added_at.strftime('%s'),
        'id': thread._question_post().id,
        'answer_count': thread.answer_count,
        'view_count': thread.view_count,
        'score': thread.score,
        'last_activity_at': thread.last_activity_at.strftime('%s'),
        'title': thread.title,
        'tags': thread.tagnames.strip().split(),
        'url': site_url(thread.get_absolute_url()),
    }
    datum['author'] = {
        'id': thread._question_post().author.id,
        'username': thread._question_post().author.username
    }
    datum['last_activity_by'] = {
        'id': thread.last_activity_by.id,
        'username': thread.last_activity_by.username
    }
    return datum

def info(request):
    '''
       Returns general data about the forum
    '''
    data = {}
    data['answers'] = models.Post.objects.get_answers().count()
    data['questions'] = models.Post.objects.get_questions().count()
    data['comments'] = models.Post.objects.get_comments().count()
    data['users'] = User.objects.filter(is_active=True).count()

    if askbot_settings.GROUPS_ENABLED:
        data['groups'] = models.Group.objects.exclude_personal().count()
    else:
        data['groups'] = 0

    json_string = simplejson.dumps(data)
    return HttpResponse(json_string, mimetype='application/json')

def user(request, user_id):
    '''
       Returns data about one user
    '''
    user = get_object_or_404(User, pk=user_id)
    data = get_user_data(user)
    data['questions'] = models.Post.objects.get_questions(user).count()
    data['answers'] = models.Post.objects.get_answers(user).count()
    data['comments'] = models.Post.objects.filter(post_type='comment').count()
    json_string = simplejson.dumps(data)
    return HttpResponse(json_string, mimetype='application/json')


def users(request):
    '''
       Returns data of the most active or latest users.
    '''
    allowed_order_by = ('recent', 'oldest', 'reputation', 'username')
    order_by = request.GET.get('sort', 'reputation')

    try:
        page = int(request.GET.get("page", '1'))
    except ValueError:
        page = 1

    if order_by not in allowed_order_by:
        raise Http404
    else:
        if order_by == 'reputation':
            users = models.User.objects.exclude(status='b').order_by('-reputation')
        elif order_by == 'oldest':
            users = models.User.objects.exclude(status='b').order_by('date_joined')
        elif order_by == 'recent':
            users = models.User.objects.exclude(status='b').order_by('-date_joined')
        elif order_by == 'username':
            users = models.User.objects.exclude(status='b').order_by('username')
        else:
            raise Exception("Order by method not allowed")


        paginator = Paginator(users, 10)

        try:
            user_objects = paginator.page(page)
        except (EmptyPage, InvalidPage):
            user_objects = paginator.page(paginator.num_pages)

        user_list = []
        #serializing to json
        for user in user_objects:
            user_dict = get_user_data(user)
            user_list.append(dict.copy(user_dict))

        response_dict = {
                    'pages': paginator.num_pages,
                    'count': paginator.count,
                    'users': user_list
                }
        json_string = simplejson.dumps(response_dict)

        return HttpResponse(json_string, mimetype='application/json')


def question(request, question_id):
    '''
    Gets a single question
    '''
    #we retrieve question by post id, b/c that's what is in the url,
    #not thread id (currently)
    post = get_object_or_404(
        models.Post, id=question_id,
        post_type='question', deleted=False
    )
    datum = get_question_data(post.thread)
    json_string = simplejson.dumps(datum)
    return HttpResponse(json_string, mimetype='application/json')


def questions(request):
    """
    List of Questions, Tagged questions, and Unanswered questions.
    matching search query or user selection
    """
    try:
        author_id = int(request.GET.get("author"))
    except (ValueError, TypeError):
        author_id = None

    try:
        page = int(request.GET.get("page"))
    except (ValueError, TypeError):
        page = None

    search_state = SearchState(
                scope=request.GET.get('scope', 'all'),
                sort=request.GET.get('sort', 'activity-desc'),
                query=request.GET.get('query', None),
                tags=request.GET.get('tags', None),
                author=author_id,
                page=page,
                user_logged_in=request.user.is_authenticated(),
            )

    qs, meta_data = models.Thread.objects.run_advanced_search(
                        request_user=request.user, search_state=search_state
                    )
    if meta_data['non_existing_tags']:
        search_state = search_state.remove_tags(meta_data['non_existing_tags'])

    #exludes the question from groups
    #global_group = models.Group.objects.get_global_group()
    #qs = qs.exclude(~Q(groups__id=global_group.id))

    page_size = askbot_settings.DEFAULT_QUESTIONS_PAGE_SIZE
    paginator = Paginator(qs, page_size)
    if paginator.num_pages < search_state.page:
        search_state.page = 1
    page = paginator.page(search_state.page)

    question_list = list()
    for thread in page.object_list:
        datum = get_question_data(thread)
        question_list.append(datum)

    ajax_data = {
        'count': paginator.count,
        'pages' : paginator.num_pages,
        'questions': question_list
    }
    response_data = simplejson.dumps(ajax_data)
    return HttpResponse(response_data, mimetype='application/json')
