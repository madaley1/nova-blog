# Nova Blog

A static page blog platform which was inspired by [Bear Blog](https://bearblog.dev).

## About

I wanted a simple self-hosted blog platform to be hosted on github pages and that I could just push markdown files to for posting. No GUI needed, just add file and push, then go to the site and see your post publicly.

## How to Deploy

This is stil an ideal process, as it is still WIP (if you're here really early there may be nothing in the repo yet lol).
My ideal process is as follows:

1. Write MD file
2. Add to ./posts directory & push
3. Run generation script (ideally gh actions does this)
4. Post Link is added to post list
5. When Post Link is visited, the JS converts the MD to HTML
6. JS returns MD as HTML and inserts it into the body, for the reader to enjoy!
