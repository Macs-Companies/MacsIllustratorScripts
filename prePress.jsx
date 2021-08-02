// -- PREPRESSER --

function prepress(){
  var startFolder = Folder('/Volumes/Desktop/Shared working files/Production') // Change this to parent folder for sock art
  var baseFolder = startFolder.selectDlg();
  var files = baseFolder.getFiles(/.pdf/);
  for(a=0;a<files.length;a++){
    var file = files[a];
    var doc = app.open(file);
    // Do PrePress Actions here
    alignCutStrokeCenter()
    outlineType()
    // Find and eliminate Overprint
    // end
    var pdfSaveOpts = new PDFSaveOptions()
    doc.saveAs(file,pdfSaveOpts)
    doc.close()
  }

  function alignCutStrokeCenter(){
    var cutlinesLayer;
    for(b=0;b<doc.layers.length;b++){
      var name = doc.layers[b].name
      if(name.match('Cut')||name.match('CUT')||name.match('cut')){
        cutlinesLayer = doc.layers[b];
        break;
      }
    }

    var cutlines = cutlinesLayer.pathItems;
    for(c=0;c<cutlines.length;c++){
      var path = cutlines[c];
      path.locked = false;
      path.selected = true;
      setStrokeAlignToCenter()
      path.selected = false;
    }

  }

  function outlineType(){
    var legacyItems = app.activeDocument.legacyTextItems
    for(e=0;e<legacyItems.length;e++){
      var legacyItem = legacyItems[e]
      legacyItem.convertToNative()
    }
    var textFrames = app.activeDocument.textFrames
    for(d=0;d<textFrames.length;d++){
      var textFrame = textFrames[d];
      try{textFrame.createOutline();}catch(err){}
    }
  }


  function setStrokeAlignToCenter() {
    if ((app.documents.length = 0)) {
      return;
    }
    var ActionString = '/version 3 /name [ 15 5374726f6b65416c69676e6d656e74 ] /isOpen 1 /actionCount 1 /action-1 { /name [ 17 416c69676e5374726f6b6543656e746572 ] /keyIndex 0 /colorIndex 0 /isOpen 0 /eventCount 1 /event-1 { /useRulersIn1stQuadrant 0 /internalName (ai_plugin_setStroke) /localizedName [ 10 536574205374726f6b65 ] /isOpen 1 /isOn 1 /hasDialog 0 /parameterCount 7 /parameter-1 { /key 2003072104 /showInPalette 4294967295 /type (unit real) /value 0.25 /unit 592476268 } /parameter-2 { /key 1667330094 /showInPalette 4294967295 /type (enumerated) /name [ 8 4275747420436170 ] /value 0 } /parameter-3 { /key 1836344690 /showInPalette 4294967295 /type (real) /value 10.0 } /parameter-4 { /key 1785686382 /showInPalette 4294967295 /type (enumerated) /name [ 10 4d69746572204a6f696e ] /value 0 } /parameter-5 { /key 1684825454 /showInPalette 4294967295 /type (integer) /value 0 } /parameter-6 { /key 1684104298 /showInPalette 4294967295 /type (boolean) /value 0 } /parameter-7 { /key 1634494318 /showInPalette 4294967295 /type (enumerated) /name [ 6 43656e746572 ] /value 0 } } }';


    createAction(ActionString);
    var ActionString = null;
    app.doScript("AlignStrokeCenter", "StrokeAlignment", false);
    app.unloadAction("StrokeAlignment", "");

    function createAction(str) {
      var f = new File("~/tempAction.aia");
      f.open("w");
      f.write(str);
      f.close();
      app.loadAction(f);
      f.remove();
    }

  }
}
prepress()
