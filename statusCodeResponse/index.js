
const COMMON_NOT_FOUND_CODE = 404

const COMMON_SUCCESS_GET_CODE = 200

const COMMON_INT_SERVER_CODE  =  500

const COMMON_UPDATE_FAIL = 400

const COM_NOT_FOUND_MESSAGE = (what) =>{
    return `${what} not found`
}
const COM_SUCCESS_POST_MESSAGE = (what) => {
    return `${what} added successfully`
}
export {
    COMMON_NOT_FOUND_CODE,
    COMMON_SUCCESS_GET_CODE,
    COM_NOT_FOUND_MESSAGE,
    COMMON_INT_SERVER_CODE,
    COMMON_UPDATE_FAIL,
    COM_SUCCESS_POST_MESSAGE,
}