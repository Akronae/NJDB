# **Description**
## **SJDB in one sentence**
SJDB (Simple JSON Database) is a very lightweight (2.75Kb) embedded/persistant JSON database to Node.js, made for little projects.



## **Warning**
SJDB isn't a *real* database, i just made this little module for my projects, i don't need real database, and i don't want it. SJDB is not fast and stable as a real database and there no crash guarantee. *(see 'crash' & 'speed' sections)*.




## **Architecture**
Data is stored into JSON files, themselves stored in a folder;
When you create a new JDatabase object, you need to specify a folder path, and database name;
It's made of this way because heavier a database file is, bigger is the operation's time;
So i recommand you to split a big database *(heavier than 10 000 keys/values)* into other multiple databases for best perfs, i course, if you keep all your data in one big file, operation time still correct.



##**JDatabase public attributes and methods three**

    db
        .create('dbName'): Create a new database.
        .table('tableName'): Select table as target.
            .create(): Create new table as '.table()' argument.
            .put('key', 'value'): Insert string or int as key into db, don't support objects. Use real editor.
            .update('key', 'newValue'): Update key.
            .get('key', 'value'): Get value from key.
            .delete('key'): Remove key and he's value.
            .get(): Get table.
            .delete(): Delete table.
        .log
	        .write(logdata, type['info', 'danger', 'success', 'log'@default]): Log in console and write in log .log&.html.
            .open(): Open logs in HTML file.
            .clear(): Clear logs.
        .dir
	        .path = "path/": folder path.
	    .file
		    .path = "path": file path
        .core
	        .handleEx = "true@default||false" : Define if SJDB handle or not all exeptions (to keep data safe if an exeption ocure).
            .compress(): Improve database's speed by compressing data, use only for production.
            .fancify(): Fancify database for humain readability, less faster, use this command only for reading.
        .db
	        .isCompressed = "true||false@default": Unlike '.compress()' method, each time that the db is modified, new data will be write with compressed or not style.
        .makeBenchmark(ops): Run a benchmark on a new db with arg Put, Update, Delete operations.

#**Tutorials**
##**The basics**
First of all, we need to import SJDB

    const SJDB = require('SJDB')
    
Then, let's instantiate our database: **{** JDatabase (class, 2 args) [@arg1: folder path, @arg2: datbase name (without .json)] **}**

    var database = new SJDB.JDatabase('./database', 'data')
Next, you can set parameters like `database.db.isCompressed = true` for data compression and remember that, even if it's not recommanded, you are able to reset db path with `database.file.path` for database file, `database.dir.path` for folder where your db is.

When all is done, we just need to build our database with

    database.create()
A folder and database file will be generated.

Once we have our database, why not put data in ?
Like you know, we first need to create a table like this

    database.table('fruitsStock').create()
Now that we get a table, the last thing to do is put a key associated with a value.

I've tried as much as possible to reproduce noSQL query style, so let's select the table where we want to put our value

    database.table('fruitsStock')
Like this you have targeted *fruit* table, next,

    database.table('fruitsStock').put('apple', 12)
**Woops!** we made a mistake, in fact there is 13 apples ;O, let's correct that!

    database.table('fruitsStock').update('apple', 13)
Hey! Someone ask for apples number

    console.log( 'There is', database.table('fruitsStock').get('apple'), 'apples!' )
Like you saw we just need to select table and use `get(key)` method.

Well, the guest buy our apples, data is new deprecated !

    database.table('fruitsStock').delete('apple')

**Okay!** we know how to store simple value in our database but what if we sell computers ? We will not store a string for computers caracteristics, hum.. is there other things ? *humps! objects, huumps!*

    var _computers = database.table('computers')
    _computers.create()
    _computers.put('FuckBookPro+sGoldDeluxeVersion', {
													screen: {
													    res: '12:4',
													    color: '8bit'
													    },
													RAM: {
														type: 'DDR1',
														size: '4 bytes'
														},
													dontGetIdea: {
														simpleObj: {
																youCanGoDeeper: {
																				weShouldStop: true
																			}
															}
														}
													})
I '_' like 'namespace' for my tables.
And now if you want to print your FuckBookPro's RAM, just get the object with 

    var myFuckBook = _computers.get('FuckBookPro+sGoldDeluxeVersion')
	console.log('RAM:', myFuckBook.RAM)

Simple as "hello" isn't it ? ;)

**I'v gone too far**, let's delete entire table !

    _computers.delete()

##**Updating data every x time**
There is a lot of embedded databases, so, why did i make another one ?
The answer is simple: I didn't find one who is really dynamicle, you don't see what i mean ? I'll explain you.

Let's say that we got an online game like oGame, for exemple, every 5 000ms, we increment players gold by 2.

First, I create my database with a table 'players' who look like this:

    player: { name, resource : { gold } }

So,

    const 