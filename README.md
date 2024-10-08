# Nova Blog

A static page blog platform which was inspired by [Bear Blog](https://bearblog.dev).

## About

I wanted a simple self-hosted blog platform to be hosted on github pages and that I could just push markdown files to for posting. No GUI needed, just add file and push, then go to the site and see your post publicly.

## Deploying to github pages

Luckily deployment is incredibly simple, just clone this repo and push it to a github pages repo, and you should be good to go!
There is a `docker-compose.yml` file in this repo if you wanted to play around with it localloy as well!

## Posting to your blog

The general workflow is as follows:
1. Write MD file
2. Add to `posts/{date}` directory & push ( i.e. `posts/2024-01-01/blogPost.md` )
3. Run generation script ( currently configured with GH actions, however can be done manually with `npm run generate` )
4. User can visit the new post and enjoy the blog!

## Common Issues

### The actions fail due to a 403
You have to allow actions to make edits to your repo. This can be done in your repo settings at `Settings > Actions > General > Workflow Permissions`. Set it to "Read and Write Permissions" and re-run the action it should work then.


## FAQ

### How do I add images to my posts?
I built a solution to this via a regex match and replace, if the markdown you are writing is not working with images, it is likely because of a difference between the version I built this with and the version you're using. I built this using Obsidian.md's markdown processor in mind, which formats images as such: `![[img.png]]`. If yours is different you have two options:
1. Swap to Obsidians formatting before submitting to Nova-Blog
2. Update the regex in the generate.mjs file, which is found on lines 28 and 35 (as of writing). I do want to make it DRYer, but as this is a hobby project it may not happen super soon. Feel free to create a PR if you want it sooner though!

### Are there plans to integrate more common blog features like search or tagging?
No, honestly there aren't plans to take this project any further. This is built to be very opinionated in its simplicity, essentially stripping  blogging down to its bare roots, which is your thoughts displayed on a site, with minor stylings. It's not built to be a super professional platform, but something someone who's never touched HTML/CSS/JS before can quickly spin up, host, and blast their thoughts into the universe. 

## Contributing
While there aren't plans to continue development much further on this platform, feel free to add issues or PRs if you think there's something that would add value! Keep in mind though, at this time this is not meant to be the most valuable, feature-rich blogging platform, quite the opposite, it is meant to be something closer to [neofetch](https://github.com/dylanaraps/neofetch), it does its job simply without too much flair or too many options. If your idea is rejected, it does not mean it was bad, it likely was very good, but not right for the philosophy of this project. Feel free to Fork it and make updates how you see fit though, I'd love to see how other people think this should be!
