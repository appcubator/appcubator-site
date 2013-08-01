# Page Content #

Create Personalized Pages for Users and Tables. This is where you connect your tables with what is displayed to your users.

Adding table specific data

![alt text](http://appcubator.com/static/img/tutorial/Twitter_ID.png) 

Twitter stores user's tweets in table. User's tweets are either displayed in lists or in individual pages with specific URL IDs. 

This documentation page will go over the individual tweet pages with specific URL IDs.

![alt text](http://appcubator.com/static/img/tutorial/TwitterURL.png) 

Modify your URL

![alt text](http://appcubator.com/static/img/tutorial/ChangeURL.png) 

- Click on your URL address field to open the 'Edit URL' window

![alt text](http://appcubator.com/static/img/tutorial/Edit_URL1.png)

- Click 'Add Context Value' to add Context Data. Context data is your Table data, like tweets, tests, posts, and users.

![alt text](http://appcubator.com/static/img/tutorial/Edit_URL2.png) 

- Click on the dropdown window to pick between  your user tables, and tables and add an 'ID'. 

![alt text](http://appcubator.com/static/img/tutorial/Edit_URL3.png) 

- Your URL will update. When your site is live, you will have a distinct id.

![alt text](http://appcubator.com/static/img/tutorial/Edit_URL4.png) 

![alt text](http://appcubator.com/static/img/tutorial/URL_ID.png) 
  
- By adding the 'Context Value' to the page URL, you can now access the 'Page Context Data' sidebar

![alt text](http://appcubator.com/static/img/tutorial/Page_Context.png) 

Page Context Data

- Drag and Drop the "Table Buttons." 

![alt text](http://appcubator.com/static/img/tutorial/Test_Buttons.png) 

In the example these store that stores the current Test and can access that Test's file, Class Major, and Class Number.

- Double click on the {{Text}} to add a description when the table information is present.

![alt text](http://appcubator.com/static/img/tutorial/Test_Description.png)

Can I put two Table Context Data pieces next to each other?

- The {{Tags}} represent that piece of information, you can copy and paste it like text so that it will read next to each other.

![alt text](http://appcubator.com/static/img/tutorial/Test_Double.png)


How do I display User Information?

Also stored are the Test Owner's information to display the user's information stored in your application database 

- Click on the other Page Context Data buttons to drag in relational information.

![alt text](http://appcubator.com/static/img/tutorial/Test_Relation.png)

- This can display information such as who created this specific tweet or test.


Here is an example of how these {{Tags}} translate from your editor to a deployed application.

Before:

![alt text](http://appcubator.com/static/img/tutorial/Test_Before.png)

After:

![alt text](http://appcubator.com/static/img/tutorial/Test_After.png)

