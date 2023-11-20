local httpc = require("resty.http").new()
local encode = require "cjson".encode
local decode = require "cjson".decode


function Split (inputstr, sep)
    if sep == nil then
            sep = "%s"
    end
    local t={}
    for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
            table.insert(t, str)
    end
    return t
end

function Get_Cookie(cookie_name) 
    local var_name = "cookie_" .. cookie_name
    local cookie_value = ngx.var[var_name]
    return cookie_value
end

function Check_auth() 
    local url = Split(ngx.var.request_uri, "/")
    
    local is_sample_dir = url[1] == 'sample'
    
    if is_sample_dir then 
        return
    end
    
    local user_id = url[2]
    local document_id = url[3]
    local token = Get_Cookie('auth-token')
    local endpoint = string.format("http://app:3000/document/%s", document_id)
    
    local res, err = httpc:request_uri(endpoint, {
        method = "GET",
        headers = {
            ["Authorization"] = token,
        },
    })
    if err or decode(res.body).statusCode == 401 then
        ngx.status = ngx.HTTP_FORBIDDEN
        ngx.eof()
        return
    end
end
Check_auth()
