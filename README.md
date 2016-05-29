# blogger-ghost-converter
A blogger xml exported file to ghost json exported file converter

Ghost export implement ghost import format [https://github.com/TryGhost/Ghost/wiki/import-format](https://github.com/TryGhost/Ghost/wiki/import-format)
 
## usage
 
 Export your blogger's blog from blogger interface :
  - Parameters
  - Other
  - Import and Saving => save content
 

```bash
  node .\main.js filename
 
```
 
## why another blogger migration tool ?
 
Because [https://github.com/bebraw/blogger2ghost](blogger2ghost) does not work for me, it does not support unicode caracter and blog with more than 150 posts.
 
