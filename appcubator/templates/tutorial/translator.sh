for f in md/*.md; 
do 
    echo "Processing $f file..";
    fname=`basename $f` 
    markdown2 $f > html/"${fname%.md}.html"
done
