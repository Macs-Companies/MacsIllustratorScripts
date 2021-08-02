
var thisScriptPath = new File($.fileName);

templateFile = File(thisScriptPath.parent+'/_TEMPLATES/Socks_Template.pdf')

startFolder = Folder(thisScriptPath.parent) // Change this to parent folder for sock art

baseFolder = startFolder.selectDlg('Select The Order Number Folder You Want To Process')
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

    if(artEven == true)
    {
        for(i=0;i<backArtArray.length;i++)
        {
            artFileBack = backArtArray[i]
            artFileFront = frontArtArray[i]

            doc = app.open(templateFile)
            app.executeMenuCommand('preview')

            // Collecting all cells and putting them into Front and Back arrays
            var frontCells = []
            var backCells = []
            for(k=0;k<doc.groupItems.length;k++)
            {
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



            artLayer = doc.layers['Layer 1']
            artLayer.locked = false

            vis = doc.layers['Visual Fold']
            vis.locked = false

            // bringing art in - rasterize it - copy and match with a cell, repeat copy and match
            //-------------------------------------------
            originalBackArt = doc.placedItems.add()
            originalBackArt.file = artFileBack
            doc.selection = null
            originalBackArt.selected = true
            clipBounds = originalBackArt.visibleBounds;
            rasOpts = new RasterizeOptions();
            rasOpts.resolution = 150
            doc.rasterize(originalBackArt, clipBounds, rasOpts);
            backArt = doc.pageItems[0]
            //-------------------------------------------
            originalFrontArt = doc.placedItems.add()
            originalFrontArt.file = artFileFront

            baseName = getDisplayName(baseFolder)
            ofName = getDisplayName(originalFrontArt.file)

            details = doc.textFrames[0]
            details.contents = baseName.toUpperCase()+' | '+ ofName.split('.')[0].toUpperCase().replace(/ FRONT|-FRONT/,'')
            details.locked = true

            disName =
            saveFile = new File( baseFolder+'/'+baseName.split(' ')[0] +'--'+ ofName.split('.')[0].toUpperCase().replace(/ FRONT|-FRONT/,'')+'.pdf' )

            doc.selection = null
            originalFrontArt.selected = true
            clipBounds = originalFrontArt.visibleBounds;
            rasOpts = new RasterizeOptions();
            rasOpts.resolution = 150
            doc.rasterize(originalFrontArt, clipBounds, rasOpts);
            frontArt = doc.pageItems[0]
            //-------------------------------------------

            for(j=0; j<backCells.length;j++)
            {
                theCell = backCells[j]
                copArt = backArt.duplicate( artLayer, ElementPlacement.PLACEATEND )
                copArt.position = theCell.position
            }
            for(j=0; j<frontCells.length;j++)
            {
                theCell = frontCells[j]
                copArt = frontArt.duplicate(artLayer, ElementPlacement.PLACEATEND)
                copArt.position = theCell.position
            }

            // remove original art and save as pdf
            backArt.remove()
            frontArt.remove()
            vis.locked = true

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
