# FlexieCMS

FlexieCMS is frontend content management system initially designed to manage MongoDB Atlas instances through MongoDB's Stitch serverless platform. Although the FlexieCMS is designed with idea that any kind of database can be managed through serverside adapters.

FlexieCMS core is javascript application written in typescript and uses react.

![Enable dev mode](/docs/flexie.cms.overview.png)

## Usage without cloning this repository

FlexieCMS can easily be tested by adding MongoDB's Stitch application id in official FlexieCMS database, which itself is managed by FlexieCMS at [https://flexiecms.ml](https://flexiecms.ml)

### Guide to adding your stitch application to FlexieCMS official website

Basic guide for adding stitch app to flexiecms.ml with anonymous access.

1. Login in your MongoDB Atlas account.
2. Chose a target database and create collection named "__flexi_conf"
3. Make sure you have at least one other collection. 
4. In left panel select "Stitch apps" > "Create New application" or choose existing one.
5. Switch to your newly created app or existing one.
6. Enable Anonymous Authentication.
7. Add rule for collection __flexi_conf so it can be read and modified
8. Allow anonymous access for at least one other collection.
9. Copy stitch app id (it looks smth like this: "flexi-cms-elihz")
10. Goto [https://flexiecms.ml](https://flexiecms.ml) and login with google authorization.
11. Turn on dev mode to see detailed view of data. Double click invisible icon next to settings icon.

![Enable dev mode](/docs/dev.mode.turn.on.png)

11. You should be in a "app_stitch" tab. Click "Insert New".
12. In the new row required fields are "App ID" which is stitch app id and "App DB" which is your database name where all the collections reside.
13. Upon setting id and db, a launch url should appear, click it to go to login page.
14. Click "anonymous login". Button with text "Create config table with default values" should appear. Click it. "__flexi_conf" table should appear.
15. Click cell in row "tables" to add your collectionname(s) separated by comma.
16. In defaultTable specify the default collection upon login.
17. Refresh page. You now should see default collection.
18. If your collection is empty click "Insert New" button, then refresh page. You should now see inserted _id as column.
19. Click add column and type new column name, hit enter. New column and empty cell should appear.
20. Type and set value for new cell.