function() {
  // Used to demonstrate that document definition fragments can access functions from the enclosing document definitions file
  function myCustomDocTypeFilter(expectedDocId) {
    return function(doc) {
      return doc._id === expectedDocId;
    };
  }

  return {
    singleQuotedFragmentDoc: importDocumentDefinitionFragment( 'fragment-string\'s-doc-definition.js' ),
    doubleQuotedFragmentDoc: importDocumentDefinitionFragment( "fragment-boolean\'s-doc-definition.js" ),
    nestedImportDoc: importDocumentDefinitionFragment('fragment-object-doc-definition.js')
  };
}
