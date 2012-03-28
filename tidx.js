// Copyright (c) 2012, Christopher Ramey | http://github.com/cramey/tidx/blob/master/LICENCE
var Tidx = function()
{
	// _index is the weighted, field-based reversed search term index
	this._index = {};

	// regex used to find terms inside a value
	this.v_rx = new RegExp('[\\w-]+', 'mg');

	// regex used to break out terms with a search
	this.s_rx = new RegExp('([\\w-]+)(:?:([\\w-]+)){0,1}', 'mg');


	// Adds data to index
	this.index = function(id, field, value)
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
				if(v.length == 0){ return; }
			break;

			default: v = String(value);
		}

		// Add field to field list, as needed
		if(this._index[f] == undefined){ this._index[f] = {}; }

		// Iterate over discrete searchable terms
		var re;
		while((re = this.v_rx.exec(value)) !== null){
			var v = re[0].toLowerCase();
			// If the field in question doesn't have this term already,
			// add it.
			if(this._index[f][v] == undefined){ this._index[f][v] = {}; }

			// Add this id to the reverse index under specific field (f)
			// and term (v), if it already exists, increment the weight
			if(this._index[f][v][id] == undefined){
				this._index[f][v][id] = 1;
			} else {
				this._index[f][v][id]++;
			}
		}
	};


	// Conducts a global search for a string (value) globally,
	// iterating through all fields.
	this.gsearch = function(result, value)
	{
		// Refuse empty searches
		if(value.length == 0){ return []; }

		var v = value.toLowerCase();

		// Loop over every field
		for(var f in this._index){
			// Look for the specified search term
			if(this._index[f][v] != undefined){
				// If it exists, add the result to r, adding in the weight
				for(var i in this._index[f][v]){
					if(result[i] == undefined){ result[i] = 0; }
					result[i] += this._index[f][v][i];
				}
			}
		}
	};


	// Conducts a field specific search for a string (value)
	this.fsearch = function(result, field, value)
	{
		var f;
		switch(typeof field){
			// Don't allow undefined fields
			case 'undefined': return;
			case 'string': f = field.toLowerCase(); break;
			default: f = String(field);
		}

		if(value.length == 0){ return []; }
		var v = value.toLowerCase();

		if(this._index[f] == undefined){ return []; }

		if(this._index[f][v] == undefined){ return []; }

		for(var i in this._index[f][v]){
			if(result[i] == undefined){ result[i] = 0; }
			result[i] += this._index[f][v][i];
		}
	};


	// Multi-term searching function - this is what you should use to
	// search with, returns an array of found ids ordered by weight
	this.search = function(search)
	{
		var r = {};

		var re;
		while((re = this.s_rx.exec(search)) !== null){
			// Global term
			if(re[3] == undefined || re[3] == ''){ this.gsearch(r, re[1]); }
			// Field specific term
			else { this.fsearch(r, re[1], re[3]); }
		}

		return this.sortresult(r);
	};


	this.sortresult = function(o)
	{
		var t = [];

		for(var i in o){ t.push([i, o[i]]); }
		t.sort(function(a,b){ return b[1] - a[1]; });

		var r = [];
		for(var i in t){ r.push(t[i][0]); }

		return r;
	};
};
