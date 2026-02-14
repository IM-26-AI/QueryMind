import re

def parse_sql_file(file_content: str) -> str:
    """
    Extracts only CREATE TABLE statements from the uploaded SQL file.
    """
    # 1. Regex to find CREATE TABLE blocks (case insensitive, multiline)
    ddl_blocks = re.findall(
        r'(CREATE\s+TABLE\s+.*?(?:;|^\s*GO))', 
        file_content, 
        flags=re.DOTALL | re.IGNORECASE | re.MULTILINE
    )
    
    if not ddl_blocks:
        return ""

    # 2. Return clean schema string
    return "\n\n".join(ddl_blocks)


def parse_sql_blocks(file_content: str) -> list:
    """
    Return a list of CREATE TABLE DDL blocks found in the SQL file.
    """
    import re

    ddl_blocks = re.findall(
        r'(CREATE\s+TABLE\s+.*?(?:;|^\s*GO))',
        file_content,
        flags=re.DOTALL | re.IGNORECASE | re.MULTILINE
    )

    return ddl_blocks