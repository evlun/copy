/*
 * Performs a deep clone of `subject`, returning a duplicate which can be
 * modified freely without affecting `subject`.
 *
 * The `originals` and `duplicates` variables allow us to copy references as
 * well, and also means we don't have to serialise any object more than once.
 */
function copy(subject, originals, duplicates) {
  if (!(subject instanceof Object))
    return subject

  var type = Object.prototype.toString.call(subject)
    , duplicate

  // create the base for our duplicate
  switch (type) {
    case '[object Array]':
      duplicate = []
      break

    case '[object Date]':
      duplicate = new Date(subject.getTime())
      break

    case '[object RegExp]':
      duplicate = new RegExp(subject)
      break

    case '[object Function]':
      duplicate = function () { return subject.apply(this, arguments) }
      break

    case '[object Uint8Array]':
    case '[object Uint8ClampedArray]':
    case '[object Uint16Array]':
    case '[object Uint32Array]':
    case '[object Int8Array]':
    case '[object Int16Array]':
    case '[object Int32Array]':
    case '[object Float32Array]':
    case '[object Float64Array]':
      duplicate = subject.subarray()
      break

    default:
      if (subject instanceof Buffer) {
        duplicate = subject.slice(0, subject.length)
        break
      }

      duplicate = {}
  }

  originals.push(subject)
  duplicates.push(duplicate)

  // special case for arrays
  if (subject instanceof Array) {
    for (var i = 0; i < subject.length; i++) {
      duplicate[i] = copy(subject[i], originals, duplicates)
    }
  }

  var keys = Object.keys(subject).sort()
    , skip = Object.keys(duplicate).sort()

  for (var j = 0; j < keys.length; j++) {
    var key = keys[j]

    // ignore keys in `skip`
    if (skip.length > 0 && key === skip[0]) {
      skip.shift()
      continue
    }

    if (Object.prototype.hasOwnProperty.call(subject, key)) {
      var value = subject[key]
        , index = originals.indexOf(value)

      duplicate[key] = index !== -1
                     ? duplicates[index]
                     : copy(subject[key], originals, duplicates)
    }
  }

  return duplicate
}

/*
 * Wrapper for `copy()`.
 */
module.exports = function (subject) {
  return copy(subject, [], [])
}
