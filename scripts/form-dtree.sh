#!/bin/sh

declare -a entries=("src/content/index.ts"
                    "src/background/index.ts"
                    "src/content/templates/settings/index.ts")

mkdir /tmp/animod-dep-tree

for (( i=0; i<${#entries[@]}; i++ ));
do
    # Requires Graphviz: brew install graphviz
    npx madge ${entries[$i]} -b src/ -i /tmp/animod-dep-tree/$i.png --include-npm
done

# Requires ImageMagick: brew install imagemagick
convert /tmp/animod-dep-tree/%d.png[0-2] -append /tmp/animod-dep-tree/tree.png

for (( i=0; i<${#entries[@]}; i++ ));
do
    rm /tmp/animod-dep-tree/$i.png
done

open /tmp/animod-dep-tree/tree.png