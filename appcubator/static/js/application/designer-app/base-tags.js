  var baseTags = {

    "button": [
      {
        tagName : 'a',
        cons_attribs: { },
        content_attribs: {
          href : "internal://Homepage"
        },
        content : "Default Button",
        isSingle: false
      }
    ],

    "image" : [
      {
        tagName : 'img',
        content_attribs : {
          src : '/static/img/placeholder.png'
        },
        content: null,
        isSingle : true
      }
    ],

    "header-text": [
      {
        tagName : 'h1',
        content_attribs: null,
        content : 'Default header!',
        isSingle: false
      }
    ],

    "text" : [
      {
        tagName : 'p',
        content_attribs: null,
        content : 'Default text!',
        isSingle: false
      }
    ],

    "link" : [
      {
        tagName  : 'a',
        content_attribs  : {
          'href' : '{{homepage}}'
        },
        content: 'Default Link...',
        isSingle: false
      }
    ],

    "text-input" : [
      {
        tagName : 'input',
        cons_attribs: {
          type : 'text'
        },
        content_attribs : {
          placeholder: 'Default placeholder...'
        },
        content : null,
        isSingle: true
      }
    ],

    "password" : [
      {
        tagName : 'input',
        tagType  : 'password',
        content_attribs : {
          placeholder: 'Default placeholder...'
        },
        content : null,
        isSingle: true
      }
    ],

    "text-area" : [
      {
        tagName  : 'textarea',
        content_attribs: null,
        content  : 'Default Text Area...',
        isSingle : false
      }
    ],

    "line" : [
      {
        tagName : 'hr',
        cons_attribs : {
        },
        content : null,
        isSingle: true
      }
    ],

    "dropdown" : [
      {
        tagName : 'select',
        content: '<option>Option 1</option>',
        attribs : null,
        isSingle: false
      }
    ],

    "box" : [
      {
        tagName : 'div',
        content: null,
        cons_attribs : {
          style : 'border:1px solid #333;'
        },
        isSingle: false
      }
    ],

    "form" : [
      {
        tagName : 'form',
        content: null,
        cons_attribs : {
        },
        isSingle: false
      }
    ],

    "list" : [
      {
        tagName : 'div',
        content: null,
        cons_attribs : {
        },
        isSingle: false
      }
    ]
};
