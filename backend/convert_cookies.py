import json

def convert_cookies_to_netscape(cookies):
    """
    Конвертирует список cookies в формате JSON в формат Netscape.
    :param cookies: Список cookie (JSON).
    :return: Строка успешного завершения операции.
    """
    output_file = "./cookies.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Netscape HTTP Cookie File\n")
        for cookie in cookies:
            domain = cookie.get('domain', '')
            flag = 'TRUE' if not cookie.get('hostOnly', False) else 'FALSE'
            path = cookie.get('path', '/')
            secure = 'TRUE' if cookie.get('secure', False) else 'FALSE'
            expiration = int(cookie.get('expirationDate', 0))
            name = cookie.get('name', '')
            value = cookie.get('value', '')

            # Формат строки для Netscape cookies
            line = f"{domain}\t{flag}\t{path}\t{secure}\t{expiration}\t{name}\t{value}\n"
            f.write(line)

    return {"message": f"Cookies успешно сохранены в файл {output_file}"}
