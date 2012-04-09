Tidx
====

Tidx is a simple Javascript full text indexing library. Tidx is
BSD licensed.


basic usage
-----------

First, create a new Tidx object:

    var idx = new Tidx();


Next, add your data to the index with the index function:

    idx.index(true, 1, 'Name', 'John D. Smith');


The index function accepts four arguments: The first is a boolean
which is if the data to be added to the index should be tokenized (that is,
broken down into discrete searchable terms), the second is the unique
identifier for the data (which will be returned when you search), a field
name associated with the data (or null if you don't have a field) and the
value you wish to add to the index. In the above example, since we've enabled
tokenization, the value would be indexed as three terms "john", "d" and
"smith".


Searching your index is easy:

    var results = idx.search(true, 'john');


The search function accepts two arguments: A boolean argument of true
if you wish your search terms to be logically conjuct (as if connected
by AND) or false if you want your terms to be logically disjunct (as if
connected by OR). The second argument is your search terms. The search
function supports multiword terms when surrounded by quotes "John Smith",
and fields can be specified by name if using a semi-colon (e.g. "name:john")
The returned results of the search function is an array of IDs ordered by 
frequency of terms from your search.

Fully functional examples of usage can be found in the examples directory.


advanced usage
--------------

Tidx also supports chaining searches together. This is useful in instances
where you may have multiple points of entry for a single search, and the 
results should be an aggregate of each. After your index is initialized
and data has been added (see above), you can then search it using raw_search:

    var raw_results = {};
    var term_count = idx.raw_search('John', raw_results);


Additional searches may then be added in the same way:

    term_count += idx.raw_search('Smith', raw_results);


Field specific, single term scans may also be included:

    term_count += idx.field_scan('Name', 'David', raw_results);


Finally, the results can be ordered and filtered:

    var results = idx.order(raw_results, term_count);


If you'd like the results of your search terms to be logically conjunct
(as if connected by AND), specific the term count you collected from search.
If you'd like them to be logically disjunct (as if connected by OR), specify
a term count of zero.
