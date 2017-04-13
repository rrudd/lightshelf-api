var Book = require('./book');

class BookView {
    /**
     * Filter out copies of same book from the view, filtered by the book.id
     */
    static filterDuplicateBooks(books) {
        let uniqueBookIds = [];
        let noDuplicates = [];
        books.forEach((book) => {
            if (uniqueBookIds.indexOf(book.id) === -1) { 
                noDuplicates.push(book);
                uniqueBookIds.push(book.id);
            } 
        });
        return noDuplicates;
    }
    /**
     * Trasform the book model to view where information is condenced so that there's 
     * no duplicate books (copies of same book) and each book view has info about all the loans of 
     * one type of book.
     */
    static transformBookArrayToViews(books) {
        //TODO loses info about who has what book currently on loan?
        //Create a map of book id and how many copies of it currently have on the library
        let currentLoansPerBook = new Map();
        books.forEach(function (book) {
            let onLoanUsers = currentLoansPerBook.get(book.id) ? currentLoansPerBook.get(book.id) : [];
            onLoanUsers.push(book.current_loan);
            currentLoansPerBook.set(book.id, onLoanUsers);
        });
        //remove duplicates book objects
        let noDuplicates = BookView.filterDuplicateBooks(books);
        //Map the book object to contain the number of copies per book
        let transformedBooks = noDuplicates.map(function (book) {
            //TODO remove current_loan, has no information meaning
            book._doc["loans"] = currentLoansPerBook.get(book._doc.id);
            return book;
        });
        return transformedBooks;
    }
    
    /**
     * Transform single book model to view with information on all copies of the book 
     * are present.
     */
    static transformBookToView(book) {
        return new Promise((resolve, reject) => {
            let view;
            //Get all loans of this book, from db by book id
            Book.find({ id: book.id }, function (err, books) {
                if (err) {
                    console.log(err);
                    reject(err);
                } 
                else {
                    view = BookView.transformBookArrayToViews(books);
                    //We're expecting to combine all copies of same book to exatcly one view
                    if (view.length === 1) {
                        resolve(view[0]); 
                    } else reject("Error in transforming to book view, found more than one view for book id: " + book.id);
                }
            });
        })
    }
}

module.exports = BookView;