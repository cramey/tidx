// Copyright (c) 2012, Christopher Ramey | http://github.com/cramey/tidx/blob/master/LICENCE
var Tidx = function()
{
	// _index is the weighted, field-based reversed search term index
	this._index = {};

	// regex used to find terms inside a value
	this.v_rx = new RegExp('(:?[a-z_-]+)|(\\d*\\.\\d+)|(\\d+)', 'mg');

	// regex used to break out terms within a search
	this.s_rx = new RegExp('(:?([a-z\\d-_]+):){0,1}(:?(:?"(.+?)")|([a-z_-]+)|(\\d*\\.\\d+)|(\\d+))', 'img')


	// Indexes data inside this object.
	this.index = function(tokenize, id, field, value)
	{
		var f;
		switch(typeof field){
			// Don't allow undefined fields
			case 'undefined': return;
			case 'string': f = field.toLowerCase(); break;
			default: f = String(field);
		}

		var v;
		switch(typeof value){
			// Don't allow undefined, null or object values
			case 'null': case 'undefined': case 'object': return; 

			case 'string':
				v = value.toLowerCase();
				// Don't index empty fields
				if(v.length === 0){ return; }
			break;

			default: v = String(value);
		}

		// Add field to field list, as needed
		if(this._index[f] === undefined){ this._index[f] = {}; }

		if(tokenize === true){
			// Iterate over discrete searchable terms
			var re;
			while((re = this.v_rx.exec(v)) !== null){
				var t = re[0];
				// If the field in question doesn't have this term already,
				// add it.
				if(this._index[f][t] === undefined){ this._index[f][t] = {}; }

				// Add this id to the reverse index under specific field (f)
				// and term (v), if it already exists, increment the weight
				if(this._index[f][t][id] === undefined){ this._index[f][t][id] = 1; }
				else { this._index[f][t][id]++; }
			}
		} else {
			if(this._index[f][v] === undefined){ this._index[f][v] = {}; }
			
			if(this._index[f][v][id] === undefined){ this._index[f][v][id] = 1; }
			else { this._index[f][v][id]++; }
		}
	};


	// Conducts a global search for a string (value) globally,
	// iterating through all fields.
	this.gsearch = function(value, result)
	{
		// Refuse empty searches
		if(value.length === 0){ return []; }

		var v = value.toLowerCase();

		// Loop over every field
		for(var f in this._index){
			// Look for the specified search term
			if(this._index[f][v] !== undefined){
				// If it exists, add the result to r, adding in the weight and count
				for(var i in this._index[f][v]){
					if(result[i] === undefined){ result[i] = {'w': 0, 'c': 0}; }
					result[i]['w'] += this._index[f][v][i];
					result[i]['c']++;
				}
			}
		}
	};


	// Conducts a field specific search for a string (value)
	this.fsearch = function(field, value, result)
	{
		var f;
		switch(typeof field){
			// Don't allow undefined fields
			case 'undefined': return;
			case 'string': f = field.toLowerCase(); break;
			default: f = String(field);
		}

		if(value.length === 0){ return []; }
		var v = value.toLowerCase();

		if(this._index[f] === undefined || this._index[f][v] === undefined){
			return [];
		}

		for(var i in this._index[f][v]){
			if(result[i] === undefined){ result[i] = {'w': 0, 'c': 0}; }
			result[i]['w'] += this._index[f][v][i];
			result[i]['c']++;
		}
	};


	// Multi-term searching function. This is what you should use
	// to search with. If and_query is true, returned results
	// must match every term. Otherwise, any ID matching any
	// term is returned.
	this.search = function(and_query, search)
	{
		var r = {};

		var re, tc=0;
		while((re = this.s_rx.exec(search)) !== null){
			var field = re[2];

			var value;
			for(var i=5; i < 9; i++){
				if(re[i] !== undefined && re[i].length !== 0){
					value = re[i];
					break;
				}
			}

			// Global term
			if(field !== undefined && field.length !== 0){
				this.fsearch(field, value, r);
			} else {
				this.gsearch(value, r);
			}
			tc++;
		}

		return this.order(r, (and_query ? tc : 0));
	};


	// Orders the result of a query. Accepts an object as a result, and 
	// the minimum floor count. In the event of an AND query, floor should
	// be quality to the number of search terms. Otherwise it should be zero.
	this.order = function(result, floor)
	{
		var t = [];

		for(var i in result){
			if(floor == 0 || result[i]['c'] >= floor){
				t.push([i, result[i]['w']]);
			}
		}

		t.sort(function(a,b){ return b[1] - a[1]; });

		var r = [];
		for(var i in t){ r.push(t[i][0]); }

		return r;
	};
};
