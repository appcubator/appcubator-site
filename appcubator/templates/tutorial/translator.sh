OLD="http://appcubator.com/static"
NEW="{{STATIC_URL}}"

for f in md/*.md; 
do 
    echo "Processing $f file..";
    fname=`basename $f` 
    hname=html/"${fname%.md}.html"
    markdown2 $f > $hname
    sed -ie "s,$OLD,$NEW,g" "$hname"
done