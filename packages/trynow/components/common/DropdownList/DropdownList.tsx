import { ReactNode, useState } from 'react';

import styles from './dropdownList.module.css';

type DropdownListElement = {
  content: ReactNode;
  id: string | number;
  disabled: boolean;
};
type DropdownProps = {
  selected: string;
  list: DropdownListElement[];
  setSelected: Function | undefined | null;
  selectorStyle?: string;
  placeholder?: string | ReactNode;
};

export const DropdownList = ({
  selected,
  list,
  setSelected,
  selectorStyle,
  placeholder,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleList = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelected = (id: string | number) => {
    if (setSelected) {
      setSelected(id);
    }

    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer}>
      <div
        className={[selectorStyle, styles.selectedElement, isOpen ? styles.selectorOpen : ''].join(
          ' ',
        )}
        onClick={toggleList}>
        {list.find(({ id }) => id === selected)?.content ?? placeholder}
        <div className={styles.dropDownCaret}></div>
      </div>
      <div className={[styles.listContainer, isOpen ? styles.openList : ''].join(' ')}>
        {list?.map(({ content, id, disabled }) => (
          <div
            onClick={() => (disabled ? null : handleSelected(id))}
            key={`dd-element-${id}`}
            className={[
              styles.element,
              disabled ? styles.disabledElement : '',
              id === selected ? styles.listSelectedElement : '',
            ].join(' ')}>
            {content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownList;
