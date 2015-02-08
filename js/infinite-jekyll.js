$(function() 
{
	var numPostsAdded = -1;
	var numColumns = -1;	//max allowed is 3

	var postURLs,
			isFetchingPosts = false,
			shouldFetchPosts = true,
			postsToLoad = 5,
			loadNewPostsThreshold = 3000;


	function initPostsContainer()
	{
		$(".postsContainer").empty();
		numPostsAdded = 0;

		var postColumnClasses = 'postColumn size-1of3';
		if(numColumns <= 1)			postColumnClasses = 'postColumn size-1of1';
		else if(numColumns == 2)	postColumnClasses = 'postColumn size-1of2';

		for(var ii=0; ii< numColumns; ++ii)
		{
			$(".postsContainer").append("<div class='"+postColumnClasses+"'></div>");
		}
	}

	function addPost($postContent)
	{
		$postContent.attr("data-article-index", numPostsAdded);
		var index = (numPostsAdded % numColumns);
		$postContent.appendTo($(".postsContainer").children().eq(index));
//		$("html").height($(".postsContainer").height());
		numPostsAdded++;
	}

	function sort_articles(a, b){
    	return ($(b).attr('data-article-index')) < ($(a).attr('data-article-index')) ? 1 : -1;    
	}

	function resize()
	{
		var numTotalPosts = postURLs.length;

		var reqNumColumns = 0;
		if(numTotalPosts == 1)	reqNumColumns = 1;
		else if(numTotalPosts == 2 || numTotalPosts == 4) reqNumColumns = 2;
		else if(numTotalPosts >= 3)	reqNumColumns = 3;

		//calculate num columns first
		var availableWidth = $(window).width();
		if(availableWidth <= 640)	reqNumColumns = 1;
		else if(availableWidth <= 1024 && numTotalPosts > 1) reqNumColumns = 2;

		if(reqNumColumns != numColumns)
		{
			numColumns = reqNumColumns;

			//preserve already downloaded posts somewhere else first
			var $articleList = $(".postArticle");
			$articleList = $articleList.sort(sort_articles);
			var $articleListLength = $(".postArticle").length;
			initPostsContainer();

			for(var ii=0; ii < $articleListLength; ++ii)
			{
				addPost($($articleList[ii]));
			}
		}
	}
	
	// Load the JSON file containing all URLs
	$.getJSON('/all-posts.json', function(data) {
		postURLs = data["posts"];
		resize();
		fetchPosts();
	});
	
	// If there's no spinner, it's not a page where posts should be fetched
	// if ($(".infinite-spinner").length < 1)
	// 	shouldFetchPosts = false;
	
	// Are we close to the end of the page? If we are, load more posts
	$(window).scroll(function(e){
		if (!shouldFetchPosts || isFetchingPosts) return;
		
		var windowHeight = $(window).height(),
				windowScrollPosition = $(window).scrollTop(),
				bottomScrollPosition = windowHeight + windowScrollPosition,
				documentHeight = $(document).height();
		
		// If we've scrolled past the loadNewPostsThreshold, fetch posts
		if ((documentHeight - loadNewPostsThreshold) < bottomScrollPosition) {
			fetchPosts();
		}
	});

	$(window).resize(function () {
   		resize();
	});
	
	// Fetch a chunk of posts
	function fetchPosts() {
		// Exit if postURLs haven't been loaded
		if (!postURLs) return;
		
		isFetchingPosts = true;
		
		// Load as many posts as there were present on the page when it loaded
		// After successfully loading a post, load the next one
		var loadedPosts = 0,
				postCount = numPostsAdded,
				callback = function() {
					loadedPosts++;
					var postIndex = postCount + loadedPosts;
					
					if (postIndex > postURLs.length-1) {
						disableFetching();
						return;
					}
					
					if (loadedPosts < postsToLoad) {
						fetchPostWithIndex(postIndex, callback);
					} else {
						isFetchingPosts = false;
					}
				};
		
		fetchPostWithIndex(postCount + loadedPosts, callback);
	}
	
	function fetchPostWithIndex(index, callback) {
		var postURL = postURLs[index];
		
		$.get(postURL, function(data) {
			//$(data).find(".post").appendTo(".posts");
			addPost($(data).find(".postArticle"));
			callback();
		});
	}
	
	function disableFetching() {
		shouldFetchPosts = false;
		isFetchingPosts = false;
		$(".infinite-spinner").fadeOut();
	}
	
});
