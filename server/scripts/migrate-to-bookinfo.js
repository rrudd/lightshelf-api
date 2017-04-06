/**
 * This script upgrades the Lightshelf database to data model
 * where book information is stored in separate collection "bookinfos".
 * 
 * This script will extract the general book information from the book collection
 * objects and insert them to the new collection bookinfos. 
 * Will update the reference to the book-info into the book object.
 * 
 *  ----      
 * |Book|  
 *  ----  --->   --------
 *  ----        |BookInfo|
 * |Book| --->   --------
 *  ----
 */


/**
 * Transform the Book object into separate BookInfo object that contains
 * the book information. The refenrence to the BookInfo is stored as reference
 * to the Book.
 */
function migrateBook(book) {
    return {
        _id: book._id,
        id: book.id,
        bookInfo: {
            id: book.id,
            title: book.title,
            description: book.description,
            publishedDate: book.publishedDate,
            pageCount: book.pageCount,
            imageLinks: book.imageLinks,
            thumbnail: book.thumbnail,
            authors: book.authors
        },
        current_loan: book.current_loan,
        office: book.office
    }
}

print("Migrating script to transform the books collection data into bookinfos collection with reference.")

var migratedBooks = [];
var cursor = db.books.find();
while (cursor.hasNext()) {
    book = cursor.next();
    //New format of book model doesn't have a title as it's part of the book-info object
    if (book.title) {
        newBook = migrateBook(book);
        migratedBooks.push(newBook);
    }
}

migratedBooks.forEach(function(book) {
    //Create new bookInfo if it doesn't exist yet. The id is unique.
    var result = db.bookinfos.update({id : book.bookInfo.id}, book.bookInfo, {upsert: true});
    var bookInfoCursor = db.bookinfos.find({id : book.bookInfo.id});
    var bookInfo = bookInfoCursor.next();
    print("BookInfo update " + bookInfo._id);
    if (bookInfo) {
        book.bookInfo = bookInfo._id; //Reference to the BookInfo object
        //Update the book
        //Don't create new book, should already exist, if not it's error
        db.books.update({ _id: book._id }, book, { upsert: false }); 
    }
}, this);

print("Updated " + migratedBooks.length + " book records");
