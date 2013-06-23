var appState = {
    "info": {
        "keywords": "",
        "description": ""
    },
    "tables": [
        {
            "fields": [
                {
                    "type": "text",
                    "name": "Content",
                    "related_name": null,
                    "entity_name": null
                },
                {
                    "related_name": "Tweets",
                    "type": "fk",
                    "name": "User",
                    "entity_name": "User",
                    "owner_entity": "Tweet"
                }
            ],
            "name": "Tweet"
        },
        {
            "name": "Feedback",
            "fields": [
                {
                    "name": "Subject",
                    "type": "text",
                    "related_name": null,
                    "entity_name": null
                },
                {
                    "name": "Feedback",
                    "type": "text",
                    "related_name": null,
                    "entity_name": null
                }
            ]
        }
    ],
    "users": [
        {
            "fields": [
                {
                    "name": "Profile Picture",
                    "type": "image",
                    "related_name": null,
                    "entity_name": null
                },
                {
                    "name": "bro",
                    "type": "m2m",
                    "related_name": "bro",
                    "owner_entity": "User",
                    "entity_name": "User"
                }
            ],
            "name": "User"
        }
    ],
    "mobilePages": [],
    "emails": [
        {
            "content": "Dear {{User.First_Name}},\n\nThanks for signing up!\n\n- {{AppName}} Team",
            "name": "Welcome Email",
            "subject": "Thanks for Signing up!"
        }
    ],
    "pages": [
        {
            "name": "Homepage",
            "access_level": "all",
            "url": {
                "urlparts": []
            },
            "footer": {
                "isFixed": true,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Help",
                        "title": "Help"
                    },
                    {
                        "url": "internal://Privacy",
                        "title": "Privacy"
                    }
                ],
                "customText": "Copyright Twitterly - Built with Appcubator"
            },
            "navbar": {
                "isFixed": true,
                "brandName": "Twitterly",
                "isHidden": false,
                "links": []
            },
            "uielements": [
                {
                    "layout": {
                        "top": 8,
                        "left": 0,
                        "height": 4,
                        "width": 4,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "nodeType": "headerTexts",
                        "isSingle": false,
                        "content_attribs": {
                            "style": "font-size:20px;"
                        },
                        "class_name": "header-1",
                        "content": "Welcome to Twitterly",
                        "tagName": "h1",
                        "activeStyle": ""
                    },
                    "type": "node"
                },
                {
                    "layout": {
                        "top": 13,
                        "left": 0,
                        "height": 9,
                        "width": 6,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "nodeType": "texts",
                        "isSingle": false,
                        "content_attribs": {},
                        "class_name": "txt",
                        "content": "Pretend like finding out what’s happening, right now, with the people and organizations you care about.\n",
                        "tagName": "span"
                    },
                    "type": "node"
                },
                {
                    "layout": {
                        "top": 25,
                        "left": 7,
                        "height": 23,
                        "width": 4,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "container_info": {
                            "action": "signup",
                            "form": {
                                "action": "signup",
                                "entity": "User",
                                "fields": [
                                    {
                                        "field_name": "username",
                                        "placeholder": "Username",
                                        "label": "Username",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "options": [],
                                        "required": false
                                    },
                                    {
                                        "name": "password1",
                                        "placeholder": "Password",
                                        "label": "Password",
                                        "displayType": "password-text",
                                        "type": "password",
                                        "options": [],
                                        "required": false
                                    },
                                    {
                                        "name": "password2",
                                        "placeholder": "Confirm Password",
                                        "label": "Confirm Password",
                                        "displayType": "password-text",
                                        "type": "password",
                                        "options": [],
                                        "required": false
                                    },
                                    {
                                        "field_name": "Email",
                                        "placeholder": "Email Address",
                                        "label": "Email Address",
                                        "displayType": "email-text",
                                        "type": "email",
                                        "options": [],
                                        "required": false
                                    },
                                    {
                                        "placeholder": "Sign Up",
                                        "displayType": "button",
                                        "type": "button",
                                        "required": false
                                    }
                                ],
                                "goto": "internal://Tweet Feed",
                                "name": "Sign Up",
                                "signupRole": "User",
                                "actions": []
                            },
                            "uielements": []
                        },
                        "entity": "User",
                        "content_attribs": {},
                        "class_name": "form-with-bg"
                    },
                    "type": "form"
                }
            ],
            "page_name": "Homepage",
            "ind": 0,
            "user_roles": [
                "User"
            ]
        },
        {
            "name": "Registration Page",
            "access_level": "all",
            "navbar": {
                "isFixed": true,
                "brandName": null,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ]
            },
            "footer": {
                "isFixed": true,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ],
                "customText": "Add custom footer text here"
            },
            "url": {
                "urlparts": [
                    "registration"
                ]
            },
            "uielements": [],
            "page_name": "Registration Page",
            "ind": 1,
            "user_roles": [
                "User"
            ]
        },
        {
            "name": "Tweet Feed",
            "url": {
                "urlparts": [
                    "Tweet_Feed"
                ]
            },
            "access_level": "all-users",
            "uielements": [
                {
                    "layout": {
                        "top": 2,
                        "left": 0,
                        "height": 10,
                        "width": 3,
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
                                        "field_name": "Content",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "label": "Content",
                                        "placeholder": "Content",
                                        "required": false
                                    },
                                    {
                                        "type": "button",
                                        "displayType": "button",
                                        "placeholder": "Submit",
                                        "required": false
                                    }
                                ],
                                "action": "create",
                                "actions": [],
                                "goto": "internal://Tweet Page/?Tweet=Form.Tweet"
                            },
                            "uielements": []
                        },
                        "content_attribs": {},
                        "class_name": "form-with-bg"
                    },
                    "type": "form"
                },
                {
                    "layout": {
                        "top": 0,
                        "left": 4,
                        "height": 46,
                        "width": 7,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "container_info": {
                            "entity": "Tweet",
                            "action": "show",
                            "uielements": [],
                            "query": {
                                "fieldsToDisplay": [],
                                "sortAccordingTo": "Date",
                                "numberOfRows": -1,
                                "where": []
                            },
                            "row": {
                                "isListOrGrid": "list",
                                "layout": {
                                    "height": 12,
                                    "width": 4,
                                    "top": 0,
                                    "left": 0,
                                    "t_padding": 0,
                                    "b_padding": 0,
                                    "l_padding": 0,
                                    "r_padding": 0,
                                    "alignment": "left"
                                },
                                "uielements": [
                                    {
                                        "layout": {
                                            "top": 13,
                                            "left": 35,
                                            "width": 444,
                                            "height": 89,
                                            "t_padding": 0,
                                            "b_padding": 0,
                                            "l_padding": 0,
                                            "r_padding": 0,
                                            "alignment": "left"
                                        },
                                        "data": {
                                            "style": "",
                                            "isSingle": false,
                                            "content_attribs": {},
                                            "hoverStyle": "",
                                            "class_name": "txt",
                                            "content": "{{loop.Tweet.Content}}",
                                            "tagName": "span",
                                            "activeStyle": ""
                                        },
                                        "type": "node"
                                    },
                                    {
                                        "layout": {
                                            "top": 104,
                                            "left": 33,
                                            "width": 440,
                                            "height": 30,
                                            "t_padding": 0,
                                            "b_padding": 0,
                                            "l_padding": 0,
                                            "r_padding": 0,
                                            "alignment": "left"
                                        },
                                        "data": {
                                            "style": "",
                                            "isSingle": false,
                                            "content_attribs": {},
                                            "hoverStyle": "",
                                            "class_name": "txt",
                                            "content": "{{loop.Tweet.User.username}}",
                                            "tagName": "span",
                                            "activeStyle": ""
                                        },
                                        "type": "node"
                                    },
                                    {
                                        "layout": {
                                            "top": 140,
                                            "left": 16,
                                            "width": 523,
                                            "height": 32,
                                            "t_padding": 0,
                                            "b_padding": 0,
                                            "l_padding": 0,
                                            "r_padding": 0,
                                            "alignment": "left"
                                        },
                                        "data": {
                                            "nodeType": "lines",
                                            "style": "border-color:#49afcd;",
                                            "isSingle": true,
                                            "cons_attribs": {},
                                            "hoverStyle": "",
                                            "class_name": "line-1",
                                            "content": null,
                                            "tagName": "hr",
                                            "activeStyle": "",
                                            "content_attribs": {}
                                        },
                                        "type": "node"
                                    }
                                ],
                                "goesTo": null
                            }
                        },
                        "content_attribs": {}
                    },
                    "type": "loop"
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
            "page_name": "Tweet Feed",
            "ind": 2,
            "user_roles": [
                "User"
            ]
        },
        {
            "name": "Help",
            "url": {
                "urlparts": [
                    "Help"
                ]
            },
            "access_level": "all",
            "uielements": [
                {
                    "layout": {
                        "top": 2,
                        "left": 1,
                        "height": 23,
                        "width": 3,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "nodeType": "images",
                        "isSingle": true,
                        "content_attribs": {
                            "src": "https://www.filepicker.io/api/file/ocm4rISpRCqMdE0zYSYU",
                            "href": "internal://Homepage"
                        },
                        "class_name": "img-full-height-width",
                        "tagName": "img",
                        "content": "https://www.filepicker.io/api/file/ocm4rISpRCqMdE0zYSYU"
                    },
                    "type": "node"
                },
                {
                    "layout": {
                        "top": 6,
                        "left": 5,
                        "height": 16,
                        "width": 4,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "container_info": {
                            "entity": "Feedback",
                            "action": "create",
                            "form": {
                                "entity": "Feedback",
                                "name": "",
                                "fields": [
                                    {
                                        "field_name": "Subject",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "label": "Subject",
                                        "placeholder": "Subject",
                                        "required": false
                                    },
                                    {
                                        "field_name": "Feedback",
                                        "displayType": "paragraph-text",
                                        "type": "text",
                                        "label": "Feedback",
                                        "placeholder": "Feedback",
                                        "required": false
                                    },
                                    {
                                        "type": "button",
                                        "displayType": "button",
                                        "placeholder": "Submite Feedback",
                                        "required": false
                                    }
                                ],
                                "action": "create",
                                "actions": [],
                                "goto": "internal://Homepage"
                            },
                            "uielements": []
                        },
                        "content_attribs": {}
                    },
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
            "page_name": "Help",
            "ind": 3,
            "user_roles": [
                "User"
            ]
        },
        {
            "name": "Privacy",
            "url": {
                "urlparts": [
                    "Privacy"
                ]
            },
            "access_level": "all",
            "uielements": [
                {
                    "layout": {
                        "top": 2,
                        "left": 1,
                        "height": 4,
                        "width": 4,
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
                        "class_name": "header-1",
                        "content": "Privacy Policy",
                        "tagName": "h1",
                        "activeStyle": ""
                    },
                    "type": "node"
                },
                {
                    "layout": {
                        "top": 7,
                        "left": 1,
                        "height": 3,
                        "width": 5,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "nodeType": "texts",
                        "isSingle": false,
                        "content_attribs": {},
                        "class_name": "txt",
                        "content": "We basically own everything",
                        "tagName": "span"
                    },
                    "type": "node"
                },
                {
                    "layout": {
                        "top": 10,
                        "left": 1,
                        "height": 4,
                        "width": 5,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "data": {
                        "nodeType": "links",
                        "isSingle": false,
                        "content_attribs": {
                            "href": "http://www.nsa.gov/"
                        },
                        "class_name": "link-1",
                        "content": "We may or may not share your data with the government",
                        "tagName": "a"
                    },
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
            "page_name": "Privacy",
            "ind": 4,
            "user_roles": [
                "User"
            ]
        },
        {
            "name": "Tweet Page",
            "url": {
                "urlparts": [
                    "Tweet_Page",
                    "{{Tweet}}"
                ]
            },
            "access_level": "all-users",
            "uielements": [],
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
            "page_name": "Tweet Page",
            "ind": 5,
            "user_roles": [
                "User"
            ]
        },
        {
            "name": "Profile Page",
            "url": {
                "urlparts": [
                    "Profile_Page",
                    "{{User}}"
                ]
            },
            "access_level": "all-users",
            "uielements": [],
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
            "page_name": "Profile Page",
            "ind": 6,
            "user_roles": [
                "User"
            ]
        },
        {
            "name": "Feedback",
            "url": {
                "urlparts": [
                    "Feedback",
                    "{{Feedback}}"
                ]
            },
            "access_level": "all",
            "uielements": [],
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
            "page_name": "Feedback",
            "ind": 7,
            "user_roles": [
                "User"
            ]
        }
    ],
    "name": "TwitterApp"
};
