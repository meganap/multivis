#multivis

+ System for visualizing the same data in different ways
+ Very preliminary system for visualizing the same underlying data with different visualization techniques.
+ Parts of this will also be used in QIIME (qiime.org) and the American Gut Project (americangut.org)

+ Only requirements are a local webserver to serve the pages. Start at index.html.

#Getting Started

Python is being used solely as an example.

## Starting a Local Server

From within multivis directory:
```
python -m SimpleHTTPServer 8888
```

## Viewing `index.html`

Open browser, navigate to `localhost:8888`, view pretty pictures.