import React, { Component } from 'react'
import { render } from 'react-dom'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import '@atlaskit/css-reset'
import styled from 'styled-components'

import data from './data'
import Column from './Column'

const Container = styled.div`
  display: flex;
`

class App extends Component {
  state = data
  onDragStart = () => {
    document.body.style.color = 'orange'
    document.body.style.transition = 'background-color 0.2s ease'
  }
  onDragUpdate = update => {
    const { destination } = update
    const opacity = destination
      ? destination.index / Object.keys(this.state.tasks).length
      : 0
    document.body.style.backgroundColor = `rgba(153,141,217, ${opacity}`
  }
  onDragEnd = result => {
    // Responsible for synchronously updating the state object
    // to reflect the drag and drop result.
    // Here is where we can persist the changes to the list(s).
    document.body.style.color = 'inherit'
    document.body.style.backgroundColor = 'inherit'
    const { destination, source, draggableId, type } = result

    if (!destination) {
      // No destination, don't do anything.
      return
    }

    // Check if location of draggable has changed.
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      // Task never moved don't do anything.
      return
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(this.state.columnOrder)
      newColumnOrder.splice(source.index, 1)
      newColumnOrder.splice(destination.index, 0, draggableId)
      const newState = {
        ...this.state,
        columnOrder: newColumnOrder
      }
      this.setState(newState)
      return
    }

    const start = this.state.columns[source.droppableId]
    const finish = this.state.columns[destination.droppableId]

    // User moves within the same column.
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      const newColumn = {
        ...start,
        taskIds: newTaskIds
      }

      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn
        }
      }

      this.setState(newState)
      return
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds)
    startTaskIds.splice(source.index, 1)
    const newStart = {
      ...start,
      taskIds: startTaskIds
    }
    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds
    }
    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    }
    this.setState(newState)
  }
  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        // This is the only required prop/method.
        onDragEnd={this.onDragEnd}
      >
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {provided => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              {this.state.columnOrder.map((columnId, index) => {
                const column = this.state.columns[columnId]
                const tasks = column.taskIds.map(
                  taskId => this.state.tasks[taskId]
                )

                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                  />
                )
              })}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    )
  }
}

render(<App />, document.getElementById('root'))
