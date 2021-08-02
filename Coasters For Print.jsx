
var thisScriptPath = new File($.fileName);

homeTemplateFile = File(thisScriptPath.parent+'/_TEMPLATES/HOME_COASTER_TEMPLATE.pdf')
carTemplateFile = File(thisScriptPath.parent+'/_TEMPLATES/CAR_COASTER_TEMPLATE.pdf')

startFolder = Folder('/Volumes/Desktop/Shared working files/Production') // Change this to parent folder for sock art
moreCoasters = true
initCoasters()
while(moreCoasters == true){
  initCoasters()
}

function initCoasters () {
baseFolder = startFolder.selectDlg('Select The Order Number Folder You Want To Process')
//baseFolder = Folder("D:/Google Drive/Scripting/Accessories/SOCKS/Socks for Print/Sample Folders/312127 Zion Park Gift and Deli")
assetsFold = Folder(baseFolder+'/_assets')



if(assetsFold.exists == true)
{
    artFiles = assetsFold.getFiles(/.ai|.pdf/i)

    // putting all art into a back array or front array
    homeArray =[]
    carArray = []
    for(i=0;i<artFiles.length;i++)
    {
        af = artFiles[i]
        disName = getDisplayName(af)
        if( disName.match('_HOMEC') && af instanceof File){ homeArray.push(af) }
        if( disName.match('_CARC') && af instanceof File){ carArray.push(af) }
    }

    $.writeln('Home Length '+homeArray.length)
    $.writeln('Car Length '+carArray.length)
    buildCoasters(homeArray, "home")
    buildCoasters(carArray, "car")
}


function buildCoasters(coasterArray, type){
  if(type == "home"){
    coasterTemplateFile = homeTemplateFile
  }else if (type == "car") {
    coasterTemplateFile = carTemplateFile
  }
          for(i=0;i<coasterArray.length;i++)
        {
            artFilecoaster = coasterArray[i]

            doc = app.open(coasterTemplateFile)
            app.executeMenuCommand('preview')

            // Collecting all cells and putting them into Front and Back arrays
            // var frontCells = []
            var positions = []
            for(k=0;k<doc.groupItems.length;k++)
            {
                grp = doc.groupItems[k]
                if(grp.name.match('Positions'))
                {
                    for(j=0;j<grp.pageItems.length;j++)
                    {
                        positions.push(grp.pageItems[j])
                    }
                }
            }



            // artLayer = doc.layers['Layer 1']
            // artLayer.locked = false

            // vis = doc.layers['Visual Fold']
            // vis.locked = false

            // bringing art in - rasterize it - copy and match with a cell, repeat copy and match
            //-------------------------------------------
            originalcoasterArt = doc.placedItems.add()
            originalcoasterArt.file = artFilecoaster
            doc.selection = null
            originalcoasterArt.selected = true
            clipBounds = originalcoasterArt.visibleBounds;
            rasOpts = new RasterizeOptions();
            rasOpts.resolution = 150
            doc.rasterize(originalcoasterArt, clipBounds, rasOpts);
            coasterArt = doc.pageItems[0]
            //-------------------------------------------
            // originalFrontArt = doc.placedItems.add()
            // originalFrontArt.file = artFileFront

            baseName = getDisplayName(baseFolder)
            ofName = getDisplayName(originalcoasterArt.file)

            // details = doc.textFrames[0]
            // details.contents = baseName.toUpperCase()+' | '+ ofName.split('.')[0].toUpperCase().replace(/ _Car*+/,'')
            // details.locked = true

            // disName =
            if(type == "home"){
              saveFile = new File( baseFolder+'/'+baseName.split(' ')[0] +'--'+ ofName.split('.')[0].toUpperCase().replace(/ _C[a-zA-Z]+([0-9]+)?/,'')+'.pdf' )
            }else{
              saveFile = new File( baseFolder+'/'+baseName.split(' ')[0] +'--'+ ofName.split('.')[0].toUpperCase().replace(/ _H[a-zA-Z]+([0-9]+)?/,'')+'.pdf' )
            }

            doc.selection = null
            // originalFrontArt.selected = true
            // clipBounds = originalFrontArt.visibleBounds;
            // rasOpts = new RasterizeOptions();
            // rasOpts.resolution = 150
            // doc.rasterize(originalFrontArt, clipBounds, rasOpts);
            // frontArt = doc.pageItems[0]
            //-------------------------------------------

            for(j=0; j<positions.length;j++)
            {
                thePosition = positions[j]
                copArt = coasterArt.duplicate()
                copArt.position = thePosition.position
                var adjustX = (copArt.width - thePosition.width)/2
                var adjustY = (copArt.height - thePosition.height)/2
                copArt.position = [(copArt.position[0] - adjustX) , (copArt.position[1] + adjustY)]
                if(type == "car"){
                  resize = (208.8 / copArt.width)*100
                  copArt.resize(resize,resize)
                }

            }
            // for(j=0; j<frontCells.length;j++)
            // {
            //     theCell = frontCells[j]
            //     copArt = frontArt.duplicate(artLayer, ElementPlacement.PLACEATEND)
            //     copArt.position = theCell.position
            // }

            // remove original art and save as pdf
            coasterArt.remove()
            // frontArt.remove()
            // vis.locked = true

            pdfSaveOpts = new PDFSaveOptions()
            doc.saveAs(saveFile, pdfSaveOpts)
            doc.close()
        }}
        moreCoasters = confirm('more to run?')
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
