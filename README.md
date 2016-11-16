![Icon](http://img15.hostingpics.net/pics/332336sloth.png)
[![NPM](https://nodei.co/npm/sjdb.png)](https://nodei.co/npm/sjdb/)
# **Description**
## **sjdb in one sentence**
sjdb (Simple JSON Database) is a very lightweight (2.75Kb) with 0 dependencie, embedded/persistant JSON database to Node.js, made for little projects.



## **Warning**
sjdb isn't a *real* database, i just made this little module for my projects, i don't need real database, and i don't want it. sjdb is not fast and stable as a real database and there no crash guarantee. *('speed' section)*.




## **Architecture**
Data is stored into JSON files, themselves stored in a folder;
When you create a new JDatabase object, you need to specify a folder path, and database name;
It's made of this way because heavier is a database file, bigger is the operation's time;
So i recommand you to split a big database *(heavier than 10 000 keys/values)* into other multiple databases for best perfs, i course, if you keep all your data in one big file, operation time still correct.



## **Speed**  
sjdb is not made to be fast, but with light data files sjdb is relatively fast.  
**Benchmark**  
-**10 ops**  
Put: 12ms  
Update: 10ms  
Delete: 12ms  

-**100 ops**  
Put: 14ms  
Update: 10ms  
Delete: 12ms  

-**1 000 ops**  
Put: 3 641ms  
Update: 6 687ms  
Delete: 4 036ms  

-**10 000 ops**    
Put: 102 382ms  
Update: 332 472ms  
Delete: 215 528ms  
  
Like you can see, don't get more than 10 000 keys in one file, just spleet a big database into multiples dbs !

You can make benchmarks by using `sjdb.makeBenchmark(numberOfOps)`, or by the sjdb Query CLI `db.makeBenchmark(ops)`



##**JDatabase public attributes and methods three**

    db
        .create(force[true||false@default]): Create a new database. If true, disable any security.
        .table('tableName'): Select table as target.
            .create(template[{}@default]@optional): Create new table as '.table()' argument, and create table from template argument if there is one.
            .put('key', 'value'): Insert string or int as key into db, don't support objects. Use real editor.
            .update('key', 'newValue'): Update key.
            .get('key', 'value'): Get value from key.
            .delete('key'): Remove key and he's value.
            .get(): Get table.
            .delete(): Delete table.
        .log
	        .write(logdata, type['info', 'danger', 'success', 'log'@default]@optional): Log in console and write in log .log&.html.
            .open(): Open logs in HTML file.
            .clear(): Clear logs.
        .dir
	        .path = "path/": folder path.
	    .file
		    .path = "path": file path
        .core
	        .handleEx = "true@default||false" : Define if sjdb handle or not all exeptions (to keep data safe if an exeption ocure).
            .compress(): Improve database's speed by compressing data, use only for production.
            .fancify(): Fancify database for humain readability, less faster, use this command only for reading.
        .db
	        .isCompressed = "true||false@default": Unlike '.compress()' method, each time that the db is modified, new data will be write with compressed or not style.
	        
#**Tutorials**
##**The basics**
First of all, we need to import sjdb

    const sjdb = require('sjdb')
    
Then, let's instantiate our database: **{** JDatabase (class, 2 args) [@arg1: folder path, @arg2: datbase name (without .json)] **}**

    var database = new sjdb.JDatabase('./database', 'data')
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
    _computers.put('FuckBook', { screen: { res: '12:4', color: '8bit' },
		RAM: { type: 'DDR1', size: '4 bytes' },
		dontGetIdea: { simpleObj: { youCanGoDeeper: { weShouldStop: true } } }
	})  
							  

*(I use '_' like 'namespace' for my tables.)*
And now if you want to print your FuckBookPro's RAM, just get the object with 

    var myFuckBook = _computers.get('FuckBook')
	console.log('RAM:', myFuckBook.RAM)

Simple as "hello" isn't it ? ;)

**I'v gone too far**, let's delete entire table !

    _computers.delete()

##**Sjdb Query CLI**

Sometimes it's pretty boring to make `node index`, `<Querys>`, `Ctrl+c` and again !
It's why it made a simple CLI, sjdb QueryCLI.

You can call this function by using `sjdb.QueryCLI(sjdbCLIIdentifier['-/'@default])` ( left '' as arg if you don't use any other CLI ).

And well, you can do the same things that in your editor, the only hic is that you can put objects :$

*( type '-/help' for list of commands)*

##**Updating data every x time**
There is a lot of embedded databases, so, why did i make another one ?
The answer is simple: I didn't find one who is really dynamicle, you don't see what i mean ? I'll explain you.

Let's say that we got an online game like oGame, for exemple, every 5 000ms, we increment players gold by 2.

First, I create my database with a table 'players' who look like this:

    player: { name, resource : { gold } }

So,

    const sjdb = require('sjdb')
	var database = new sjdb.JDatabase('./database', 'data')
	
	// vars
	var players = {
	    1: {
	        name: 'xXShadowKillerXx',
	        resource: { gold: 12 }
	    },
	    2: {
	        name: 'DarkBloodAssassinSuperKiller',
	        resource: { gold: 4 }
	    },
	    3: {
	        name: 'Joe',
	        resource: { gold: 32 }
	    }
	}
	
	var _players = database.table('players')
	
	
	// db
	database.create()
	_players.create(players)
	
	// Check if we get our players
	console.log(_players.get())
	
	// output should be like: { '1': { name: 'xXShadowKillerXx', resource: { gold: 12 } },
	//  '2': { name: 'DarkBloodAssassinSuperKiller', resource: { gold: 4 } },
	//  '3': { name: 'Joe', resource: { gold: 32 } } }
Okay, so if we want to update our players's gold each 5 000ms, we need to set an interval, get players loop throw increment players[loop].resource.gold by 2 and update player.

    (...)
    // vars
	var _players = database.table('players')
	
	// db
	setInterval(() => {
	    var players = _players.get()
	
	    for ( var player in players ) {
	        var newGold = parseInt(players[player].resource.gold) + 2
	        players[player].resource.gold = newGold
	
	        _players.update(player, players[player])
	    }
	}, 5000)
*(Integers are always stored as string)*

And you can look at your db while node is running, players gold goes up !

##**Miscs**
*In this 'tutorial' i'll skip db creation etc.*


**Compress database**
You maybe want to compress ( not zip or anything else ) your database ( or delete all whitespaces ), for speed or size / weight.. this can be done by using `database.compress()` method!


**Fancify database**
If you've compressed your db and want to read it, just use `database.fancify()` method.


**Logs**
Sometimes, is good to log, make sure that `database.core.log = true`, next, use `database.log.write('simple log!', 'info')`, this will be logged into console and write into log. html&log files.
Now if you want to see your logs use: `database.log.open()`, who will open your logs with fancy colors in current browser.
Got too many logs ? `database.log.delete()`

CAUTION: Don't log too much (throw loops etc.) else you will get an error.. :( ! (too many oponed files)


<br/>
Well, now, sjdb, don't get any secrets for you ! ;)

#**About the author**
Hey! :)
My name is Alexandre Daubricourt, i'm from Paris, France (I'm sorry  if i made spellcheck mistakes :$), and I just created this little JSON storage module for my own uses, 'cause i don't want to pay real database hosting, and well sjdb work great so.. I just share what i made ^^

**mail:** alexr.daubricourt@gmail.com
**Twitter:** [@AlexDaubricourt](https://twitter.com/AlexDaubricourt)
**Github:** [Akronae](https://github.com/Akronae)
**npm:** [akrone](https://www.npmjs.com/~akrone)
<br/>
<div>Icons made by <a href="http://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
