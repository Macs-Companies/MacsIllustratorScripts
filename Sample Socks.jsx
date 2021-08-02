
var thisScriptPath = new File($.fileName);

templateFile = File(thisScriptPath.parent+'/_TEMPLATES/Socks_Template.pdf')

startFolder = Folder(thisScriptPath.parent) // Change this to parent folder for sock art

baseFolder = startFolder.selectDlg('Select The Order Number Folder You Want To Process')
qty = prompt('Pair Quantity',1)
//baseFolder = Folder("D:/Google Drive/Scripting/Accessories/SOCKS/Socks for Print/Sample Folders/312127 Zion Park Gift and Deli")
assetsFold = Folder(baseFolder+'/_assets')




if(assetsFold.exists == true)
{
    artFiles = assetsFold.getFiles(/.ai|.pdf/i)

    // putting all art into a back array or front array
    frontArtArray =[]
    backArtArray = []
    for(i=0;i<artFiles.length;i++)
    {
        af = artFiles[i]
        disName = getDisplayName(af)
        if( disName.match('BACK') && af instanceof File){ backArtArray.push(af) }
        else if( !disName.match('BACK') && af instanceof File) { frontArtArray.push(af) }
    }

    $.writeln('Front Length '+frontArtArray.length)
    $.writeln('Back Length '+backArtArray.length)

    // make sure everything is in pairs
    artEven = true
    if(frontArtArray.length != backArtArray.length)
    {
        alert("There doesn't seem to be the same amount of Front designs as Back sock art.\nCheck the files in your assets folder and try again.")
        artEven = false
    }

    if(artEven == true){
      set = 0
      while(backArtArray.length > 0){
        // Collecting all cells and putting them into Front and Back arrays
        set ++
        doc = app.open(templateFile)
        app.executeMenuCommand('preview')
        artLayer = doc.layers['Layer 1']
        artLayer.locked = false

        vis = doc.layers['Visual Fold']
        vis.locked = false

        var frontCells = []
        var backCells = []
        for(k=0;k<doc.groupItems.length;k++){
            grp = doc.groupItems[k]
            if(grp.name.match('CELL GROUP'))
            {
                if(grp.name.match('GROUP FRONT'))
                {
                    for(j=0;j<grp.pageItems.length;j++)
                    {
                        frontCells.push(grp.pageItems[j])
                    }
                }
                if(grp.name.match('GROUP BACK'))
                {
                    for(j=0;j<grp.pageItems.length;j++)
                    {
                        backCells.push(grp.pageItems[j])
                    }
                }
            }
        }
        cellIndex = 0
        for(a=0;a<(12/qty)&&frontArtArray.length>0;a++){
          artFileBack = backArtArray[0]
          artFileFront = frontArtArray[0]

          originalBackArt = doc.placedItems.add()
          originalBackArt.file = artFileBack
          doc.selection = null
          originalBackArt.selected = true
          clipBounds = originalBackArt.visibleBounds;
          rasOpts = new RasterizeOptions();
          rasOpts.resolution = 150
          doc.rasterize(originalBackArt, clipBounds, rasOpts);
          backArt = doc.pageItems[0]

          originalFrontArt = doc.placedItems.add()
          originalFrontArt.file = artFileFront
          doc.selection = null
          originalFrontArt.selected = true
          clipBounds = originalFrontArt.visibleBounds;
          rasOpts = new RasterizeOptions();
          rasOpts.resolution = 150
          doc.rasterize(originalFrontArt, clipBounds, rasOpts);
          frontArt = doc.pageItems[0]
          for(b=0;b<qty;b++){
            frontArt.duplicate().position = frontCells[cellIndex].position
            backArt.duplicate().position = backCells[cellIndex].position
            cellIndex++
            frontArt.duplicate().position = frontCells[cellIndex].position
            backArt.duplicate().position = backCells[cellIndex].position
            cellIndex++
          }
          frontArt.remove()
          backArt.remove()

          backArtArray.shift()
          frontArtArray.shift()
        }

        saveFile = new File( baseFolder+'/'+getDisplayName(baseFolder)+'--SOCK SET '+set+'.pdf' )
        pdfSaveOpts = new PDFSaveOptions()
        doc.saveAs(saveFile, pdfSaveOpts)
        doc.close()

      }

    }
}


function getDisplayName(theObject)
{
    if(theObject != null)
    {
        if (theObject.fsName.match(/\\/)) { fileNameArray = theObject.fsName.split(/\\/) }
        else { fileNameArray = theObject.fsName.split(/\//) }
        theDisplayName = fileNameArray[fileNameArray.length - 1]
        return theDisplayName;

    }
    else("Can't get displayName. Object is null")
}
