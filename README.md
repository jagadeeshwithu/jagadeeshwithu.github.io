Wilderhood blog

With grid based jekyll infinite scrolling

If you want to cut down a post, put the below code at the position where you want to cut it with a Read More.

```sh
<ul class="readMore pager">
	<li class="next">
		<a href="{{page.url}}" data-toggle="tooltip" data-placement="top" title="{{page.title}}">Read More</a>
	</li>
</ul>
<div class="readMoreAfter">
```

and put a

```sh
</div>
```

at the end of the post