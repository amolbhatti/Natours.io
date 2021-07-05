/* eslint-disable node/no-unsupported-features/es-syntax */
// api features class

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //2) filtering
    const queryObj = { ...this.queryString };
    const excludeFiles = ['page', 'sort', 'limit', 'field'];
    excludeFiles.forEach((el) => delete queryObj[el]);

    //2 Advance filtering
    // replace gte,gt,lte,lt with $lte,$lt,$gte,$gt
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );

    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    // 3) sorting
    if (this.queryString.sort) {
      // sort('price averageRating') and - sign indicates descending order
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  exclude() {
    //4) excluding fileds
    if (this.queryString.field) {
      // select('price averageRating') and - sign indicates exclude fields
      const field = this.queryString.field.split(',').join(' ');
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIfeatures;
