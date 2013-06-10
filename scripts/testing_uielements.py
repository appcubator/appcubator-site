test_json = r"""
{
    "name": "NewestApp",
    "info": {
        "keywords": "",
        "domain": "v1factory.org",
        "description": "",
        "name": ""
    },
    "users": [
        {
            "name": "User",
            "fields": [
                {
                    "name": "company",
                    "type": "fk",
                    "entity_name": "Company",
                    "related_name": "members"
                }
            ]
        }
    ],
    "tables": [
        {
            "name": "Company",
            "fields": [
                {
                    "name": "Name",
                    "type": "text"
                },
                {
                    "name": "Description",
                    "type": "text"
                }
            ]
        },
        {
            "name": "Tweet",
            "fields": [
                {
                    "name": "Content",
                    "type": "text"
                },
                {
                    "name": "tweeter",
                    "type": "fk",
                    "entity_name": "User",
                    "related_name": "tweets"
                }
            ]
        }
    ],
    "pages": [
        {
            "url": {
                "urlparts": []
            },
            "navbar": {
                "isFixed": true,
                "brandName": "AlperGamez",
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    }
                ]
            },
            "footer": {
                "isFixed": true,
                "customText": "",
                "brandName": "AlperGamez",
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    }
                ]
            },
            "uielements": [
                {
                    "layout": {
                        "top": 3,
                        "height": 7,
                        "width": 8,
                        "alignment": "center",
                        "left": 2,
                        "t_padding": 15,
                        "b_padding": 15,
                        "l_padding": 0,
                        "r_padding": 0
                    },
                    "type": "node",
                    "data": {
                        "style": "font-size: 32px;\nfont-weight: bold;",
                        "isSingle": false,
                        "content_attribs": {},
                        "hoverStyle": "",
                        "class_name": "header-1",
                        "container_info": null,
                        "content": "Welcome to Alper Games<br>",
                        "tagName": "h1",
                        "type": "headerTexts",
                        "activeStyle": "",
                        "context": null
                    },
                    "context": null
                },
                {
                    "layout": {
                        "width": 3,
                        "top": 15,
                        "height": 16,
                        "left": 2,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "type": "form",
                    "data": {
                        "content": "",
                        "container_info": {
                            "uielements": [],
                            "form": {
                                "fields": [
                                    {
                                        "field_name": "username",
                                        "placeholder": "Username",
                                        "label": "Username",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "options": []
                                    },
                                    {
                                        "name": "password",
                                        "placeholder": "Password",
                                        "label": "Password",
                                        "displayType": "password-text",
                                        "type": "password",
                                        "options": []
                                    },
                                    {
                                        "placeholder": "Login"
                                    }
                                ],
                                "entity": "User",
                                "action": "login",
                                "goto": {
                                    "page_name": "Homepage",
                                    "urldata": {}
                                },
                                "belongsTo": null,
                                "name": "",
                                "actions": []
                            }
                        },
                        "content_attribs": {},
                        "context": null
                    },
                    "context": null
                },
                {
                    "layout": {
                        "width": 3,
                        "top": 15,
                        "height": 27,
                        "left": 7,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "type": "form",
                    "data": {
                        "content": "",
                        "container_info": {
                            "uielements": [],
                            "form": {
                                "fields": [
                                    {
                                        "name": "username",
                                        "placeholder": "Username",
                                        "label": "Username",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "options": []
                                    },
                                    {
                                        "name": "password1",
                                        "placeholder": "Password",
                                        "label": "Password",
                                        "displayType": "password-text",
                                        "type": "password",
                                        "options": []
                                    },
                                    {
                                        "name": "password2",
                                        "placeholder": "Confirm Password",
                                        "label": "Confirm Password",
                                        "displayType": "password-text",
                                        "type": "password",
                                        "options": []
                                    },
                                    {
                                        "name": "email",
                                        "placeholder": "Email Address",
                                        "label": "Email Address",
                                        "displayType": "email-text",
                                        "type": "email",
                                        "options": []
                                    },
                                    {
                                        "placeholder": "Sign Up"
                                    }
                                ],
                                "entity": "User",
                                "action": "signup",
                                "goto": {
                                    "page_name": "Homepage",
                                    "urldata": {}
                                },
                                "belongsTo": null,
                                "name": "",
                                "actions": []
                            }
                        },
                        "content_attribs": {},
                        "context": null
                    },
                    "context": null
                }
            ],
            "name": "Homepage",
            "access_level": "all",
            "page_name": "Homepage",
            "ind": 0,
            "user_roles": [
                null
            ]
        },
        {
            "name": "create a company",
            "url": {
                "urlparts": [
                    "create_a_company"
                ]
            },
            "access_level": "all",
            "uielements": [
                {
                    "layout": {
                        "top": 5,
                        "left": 4,
                        "height": 21,
                        "width": 4,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "container_info": {
                            "entity": "Company",
                            "action": "create",
                            "form": {
                                "entity": "Company",
                                "name": "",
                                "fields": [
                                    {
                                        "name": "Name",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "label": "Name",
                                        "placeholder": "Name"
                                    },
                                    {
                                        "name": "Description",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "label": "Description",
                                        "placeholder": "Description"
                                    },
                                    {
                                        "name": "Submit",
                                        "type": "button",
                                        "label": " ",
                                        "displayType": "button",
                                        "placeholder": "Submit"
                                    }
                                ],
                                "action": "create",
                                "actions": [
                                    {
                                        "set_fk": "CurrentUser.company",
                                        "to_object": "this"
                                    }
                                ],
                                "belongsTo": null
                            },
                            "uielements": []
                        },
                        "content_attribs": {}
                    },
                    "context": null,
                    "container_info": null,
                    "type": "form"
                }
            ],
            "navbar": {
                "brandName": null,
                "isHidden": false,
                "isFixed": true,
                "links": []
            },
            "footer": {
                "customText": "Add custom footer text here",
                "isHidden": false,
                "isFixed": true,
                "links": []
            },
            "page_name": "create a company",
            "ind": 1,
            "user_roles": [
                null
            ]
        },
        {
            "name": "create a tweet",
            "url": {
                "urlparts": [
                    "create_a_tweet"
                ]
            },
            "access_level": "all",
            "uielements": [
                {
                    "layout": {
                        "top": 13,
                        "left": 4,
                        "height": 14,
                        "width": 4,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "container_info": {
                            "entity": "Tweet",
                            "action": "create",
                            "form": {
                                "entity": "Tweet",
                                "name": "",
                                "fields": [
                                    {
                                        "name": "Content",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "label": "Content",
                                        "placeholder": "Content"
                                    },
                                    {
                                        "name": "Submit",
                                        "type": "button",
                                        "label": " ",
                                        "displayType": "button",
                                        "placeholder": "Submit"
                                    }
                                ],
                                "action": "create",
                                "actions": [
                                    {
                                        "set_fk": "this.tweeter",
                                        "to_object": "CurrentUser"
                                    }
                                ],
                                "belongsTo": null
                            },
                            "uielements": []
                        },
                        "content_attribs": {}
                    },
                    "context": null,
                    "container_info": null,
                    "type": "form"
                },
                {
                    "layout": {
                        "top": 0,
                        "left": 2,
                        "height": 9,
                        "width": 9,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "nodeType": "headerTexts",
                        "isSingle": false,
                        "content_attribs": {},
                        "hoverStyle": "",
                        "class_name": "header-1",
                        "content": "Create a tweet and it will add it to your tweets automatically",
                        "tagName": "h1",
                        "activeStyle": ""
                    },
                    "context": null,
                    "type": "node"
                }
            ],
            "navbar": {
                "brandName": null,
                "isHidden": false,
                "isFixed": true,
                "links": []
            },
            "footer": {
                "customText": "Add custom footer text here",
                "isHidden": false,
                "isFixed": true,
                "links": []
            },
            "page_name": "create a tweet",
            "ind": 2,
            "user_roles": [
                null
            ]
        }
    ],
    "emails": [
        {
            "content": "Dear {{User.First_Name}},\n\nThanks for signing up!\n\n- {{AppName}} Team",
            "name": "Welcome Email",
            "subject": "Thanks for Signing up!"
        }
    ],
    "mobilePages": []
}"""

import simplejson
test_dict = simplejson.loads(test_json)

from app_builder.analyzer import App
app = App.create_from_dict(test_dict)

from app_builder.controller import main

def test():
    codes, coder = main(app)
    from app_builder.coder import write_to_fs
    tmp_project_dir = write_to_fs(coder, css="")

    print "Project written to: %s" % tmp_project_dir
    return tmp_project_dir

test()
