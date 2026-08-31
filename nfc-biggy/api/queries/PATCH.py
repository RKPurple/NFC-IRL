INVENTORY_QUANTITY = """
    UPDATE inventory_items
    SET quantity = quantity + %s
    WHERE id = %s
    RETURNING *
"""

DECREMENT_INVENTORY_QUANTITY = """
    UPDATE inventory_items
    SET quantity = quantity - %s
    WHERE id = %s AND quantity > 0
    RETURNING *
"""

UPDATE_INVENTORY_ITEM = """
    UPDATE inventory_items
    SET {set_clause}
    WHERE id = %s
    RETURNING *
"""