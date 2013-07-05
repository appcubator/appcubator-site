var HomepageTemp = {
    "name": "Homepage",
    "url": {
        "urlparts": []
    },
    "access_level": "all",
    "uielements": [
        {
            "type": "node",
            "layout": {
                "top": 4,
                "left": 1,
                "height": 4,
                "width": 3,
                "t_padding": 0,
                "b_padding": 0,
                "l_padding": 0,
                "r_padding": 0,
                "alignment": "left"
            },
            "data": {
                "nodeType": "headerTexts",
                "style": "font-size: 32px;\nfont-weight: bold;",
                "isSingle": false,
                "content_attribs": {},
                "hoverStyle": "",
                "class_name": "header-3",
                "content": "Twitterly",
                "tagName": "h1",
                "activeStyle": ""
            }
        },
        {
            "type": "node",
            "layout": {
                "top": 10,
                "left": 1,
                "height": 6,
                "width": 4,
                "t_padding": 0,
                "b_padding": 0,
                "l_padding": 0,
                "r_padding": 0,
                "alignment": "left"
            },
            "data": {
                "nodeType": "texts",
                "tagName": "p",
                "content_attribs": {},
                "content": "Like Twitter, but better. It let's you know what's going on around you.",
                "isSingle": false,
                "style": "",
                "hoverStyle": "",
                "activeStyle": "",
                "class_name": "normal-text"
            }
        },
        {
            "type": "node",
            "layout": {
                "top": 17,
                "left": 1,
                "height": 14,
                "width": 4,
                "t_padding": 0,
                "b_padding": 0,
                "l_padding": 0,
                "r_padding": 0,
                "alignment": "left"
            },
            "data": {
                "nodeType": "images",
                "style": "",
                "isSingle": true,
                "content_attribs": {
                    "src": "https://www.filepicker.io/api/file/qwGPCIr9QiSrPuGUKuj1"
                },
                "hoverStyle": "",
                "class_name": "img-height-fixed",
                "content": "",
                "tagName": "img",
                "activeStyle": ""
            }
        },
        {
            "type": "form",
            "layout": {
                "top": 5,
                "left": 7,
                "height": 14,
                "width": 4,
                "t_padding": 0,
                "b_padding": 0,
                "l_padding": 0,
                "r_padding": 0,
                "alignment": "left"
            },
            "data": {
                "nodeType": "form",
                "class_name": "form-with-bg",
                "container_info": {
                    "action": "login",
                    "form": {
                        "name": "local login",
                        "action": "login",
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
                                "name": "password",
                                "placeholder": "Password",
                                "label": "Password",
                                "displayType": "password-text",
                                "type": "password",
                                "options": [],
                                "required": false
                            },
                            {
                                "placeholder": "Login",
                                "label": "Login",
                                "displayType": "button",
                                "type": "button",
                                "required": false
                            }
                        ],
                        "loginRoutes": [
                            {
                                "role": "User",
                                "redirect": "internal://Homepage"
                            }
                        ],
                        "entity": "User",
                        "actions": []
                    }
                },
                "content_attribs": {}
            }
        },
        {
            "type": "node",
            "layout": {
                "top": 19,
                "left": 7,
                "height": 3,
                "width": 4,
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
            }
        },
        {
            "type": "node",
            "layout": {
                "top": 22,
                "left": 7,
                "height": 2,
                "width": 2,
                "t_padding": 0,
                "b_padding": 0,
                "l_padding": 0,
                "r_padding": 0,
                "alignment": "left"
            },
            "data": {
                "nodeType": "links",
                "style": "",
                "isSingle": false,
                "content_attribs": {
                    "href": "internal://Homepage"
                },
                "hoverStyle": "",
                "class_name": "link-1",
                "content": "Signup Now »\n",
                "tagName": "a",
                "activeStyle": ""
            }
        }
    ],
    "navbar": {
        "brandName": "Twitterly",
        "isHidden": false,
        "isFixed": true,
        "links": []
    },
    "footer": {
        "customText": "Powered by Appcubator",
        "isHidden": false,
        "isFixed": true,
        "links": []
    },
    "page_name": "Homepage",
    "ind": 0,
    "user_roles": [
        "User"
    ]
}