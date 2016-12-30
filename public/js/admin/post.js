$(document).ready(function () {

	var ndCategory = $('#js-category');
	var ndAuthor = $('#js-author');
	var ndKeyword = $('#js-keyword');

	$('#js-filter-submit').on('click',function(){
		var query = queryString.parse(location.search);
		var category = ndCategory.val();
		var author = ndAuthor.val();
		var keyword = ndKeyword.val();

		if(category){
			query.category = category;
		}else{
			delete query.category;
		}

		if(query){
			query.author = author;
		}else{
			delete query.author;
		}

		if(keyword){
			query.keyword = keyword;
		}else{
			delete query.keyword;
		}

		console.log(window.location.origin);
		console.log(window.location.pathname);
		console.log(query);

		window.location.url = window.location.origin+window.location.pathname+query;

	});
});
