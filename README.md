# Build Dependencies

To build the game you need the following tools:

* __brew__ http://mxcl.github.com/homebrew/
* __ruby__ http://www.ruby-lang.org/en/downloads/
* __gem__ http://rubygems.org/pages/download
* __rake__ `gem install rake`
* __markdown__ `brew install markdown`
* __gcc__ (you should install XCode)
* __node__ & npm http://nodejs.org/
* __lessc__ `npm install -g less`
* __jslint__ `npm install -g jslint`
* __spritopia__ `gem install spritopia`
* __pngcrush__ (optional) `brew install pngcrush`


# Getting Started

`git clone git@github.com:wooga/pocket_island.git`

run `rake` to generate all config files, sprite images, etc.

## Rake tasks

- `rake all` : Build project. Copies final files to build/
- `rake check_missing_files` : List files that are referenced by the game, but don't exist
- `rake clean` : Remove any temp file.
- `rake clobber` : Remove any generated file.
- `rake default` : what does it do?
- `rake lint` : Run jslint
- `rake list_extra_files` : List files that are not referenced by the game but are in the project
- `rake remove_trailing_spaces` : Remove trailing spaces


### Adding new sprites

Start with creating a ``.sprite`` file that lists individual images
that should be included in the sprite. Then run:

    rake sprite_name.png

to generate the image based on ``sprite_name.sprite`` file.
An image and ``sprite_name.json`` will be generated.
Use the value from the json file to update ``entities.json`` with
``width``, ``height``, ``spritey`` and ``offsetY`` values.
Remember to divide pixel values by 48 before entering them in ``entities.json``.